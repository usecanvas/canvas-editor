import CopyPaste from 'canvas-editor/lib/copy-paste';
import Ember from 'ember';
import Key from 'canvas-editor/lib/key';
import Selection from 'canvas-editor/mixins/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import { highlight } from 'canvas-editor/lib/markdown/parser';

const { computed, getWithDefault, observer, on } = Ember;
const isFirefox = window.navigator.userAgent.includes('Firefox');

/**
 * A mixin for including text content in a canvas that is user-editable.
 *
 * @class CanvasEditor.ContentEditableMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create(Selection, SelectionState, {
  attributeBindings: ['contentEditable:contenteditable'],
  isUpdatingBlockContent: false,
  usesMarkdown: true,

  contentEditable: computed('isMultiBlock', 'editingEnabled', function() {
    return this.get('editingEnabled') && !this.get('isMultiBlock');
  }),

  /**
   * @member {string} The content being edited
   */
  editedContent: computed.alias('block.content'),

  selectionState: computed(function() {
    return new SelectionState(this.get('element'));
  }),

  click(evt) {
    let link;
    if (link = this.$(evt.target).closest('a').get(0)) {
      if (evt.metaKey) {
        window.open(link.href);
      } else {
        window.location = link.href;
      }
    }
  },

  getElementRect(side = 'top') {
    const rects = this.get('element').getClientRects();
    if (side === 'top') return rects[0];
    return rects[rects.length - 1];
  },

  /**
   * Get the current element text.
   *
   * This method ensures that an element with the placeholder <br> evaluates
   * as an empty string.
   *
   * @method
   */
  getElementText() {
    const element = this.get('element');
    if (element.childNodes.length === 1 &&
        element.firstChild.nodeName === 'BR') return '';
    let text = element.innerText || element.textContent;
    // Firefox appends a <br> to the end of contenteditable
    if (isFirefox) text = text.replace(/\n$/, '');
    return text;
  },

  /**
   * React to an "input" event, where the user has changed content in the DOM.
   *
   * @method
   */
  input() {
    const text = this.getElementText();
    this.setBlockContentFromInput(text);
    if (!this.get('usesMarkdown')) return;
    if (isFirefox) return;
    this.get('selectionState').capture();
    this.renderBlockContent();
    this.get('selectionState').restore();
  },

  /**
   * React to a "keydown" event.
   *
   * @method
   * @param {Event} evt The event fired
   */
  keyDown(evt) { // eslint-disable-line max-statements
    if (!this.get('contentEditable')) return;

    const key = new Key(evt.originalEvent);

    if (key.is('left')) {
      this.navigateLeft(evt);
    } else if (key.is('up')) {
      this.navigateUp(evt);
    } else if (key.is('right')) {
      this.navigateRight(evt);
    } else if (key.is('down')) {
      this.navigateDown(evt);
    } else if (key.is('backspace')) {
      this.backspace(evt);
    } else if (key.is('return') && key.hasNot('shift')) {
      evt.stopPropagation();
      evt.preventDefault();
      this.newBlockAtSplit();
    } else if (key.is('p')) {
      if (!key.hasAll('meta', 'ctrl')) return;
      if (!this.get('isTemplate')) return;
      evt.stopPropagation();
      evt.preventDefault();
      this.toggleProperty('isEditingPlaceholder');
    } else if (key.is('meta', 'a')) {
      this.selectAll(evt);
    } else if (key.is('shift', 'up')) {
      evt.preventDefault();
      this.get('onMultiBlockSelectUp')(this.get('block'));
    } else if (key.is('shift', 'down')) {
      evt.preventDefault();
      this.get('onMultiBlockSelectDown')(this.get('block'));
    }
  },

  /**
   * Called when the user pastes text.
   *
   * We check the pasted text and make sure to insert plain text only.
   *
   * @method
   * @param {Event} evt The event fired
   */
  paste(evt) {
    if (this.get('block.isSelected')) return;
    evt.preventDefault();
    evt.stopPropagation();
    const { pastedLines } = new CopyPaste(evt);
    if (pastedLines === null) {
      const text = evt.originalEvent.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    } else if (this.get('block.content') === '') {
      this.get('pasteBlocksAfter')(this.get('block'), pastedLines, true);
    } else {
      this.newBlockAtSplit();
      this.get('pasteBlocksAfter')(this.get('block'), pastedLines);
    }
  },

  /**
   * Called when the user presses the backspace key.
   *
   * We analyze the text of the block and join it with the previous block (or
   * just remove it).
   *
   * @method
   * @param {Event} evt The event fired
   */
  backspace(evt) {
    const { textBeforeSelection, textAfterSelection } =
      TextManipulation.getManipulation(this.get('element'));
    if (textBeforeSelection || !this.get('selection.isCollapsed')) return;
    evt.stopPropagation();
    evt.preventDefault();
    this.get('onBlockDeletedLocally')(this.get('block'), textAfterSelection);
  },

  onChangeEditPlaceholder: observer('isEditingPlaceholder', function() {
    if (!this.get('isEditingPlaceholder')) this.$().focus();
  }),

  /**
   * Called when the user wishes to navigate their cursor down.
   *
   * We analyze the position of the cursor and either let the default navigation
   * occur or manually navigate to the next block.
   *
   * @method
   * @param {Event} evt The event fired
   */
  navigateDown(evt) {
    const contentBottom = this.getElementRect('bottom').bottom;
    const rangeRect = this.get('currentRangeRect');
    const distanceFromBottom = contentBottom - rangeRect.bottom;
    if (distanceFromBottom > 10) return; // Navigate within this element
    evt.stopPropagation();
    evt.preventDefault();
    this.get('onNavigateDown')(this.get('block'), rangeRect);
  },

  /**
   * Called when the user wishes to navigate their cursor left.
   *
   * We analyze the position of the cursor and either let the default navigation
   * occur or manually navigate to the end of the previous block.
   *
   * @method
   * @param {Event} evt The event fired
   */
  navigateLeft(evt) {
    const { textBeforeSelection } =
      TextManipulation.getManipulation(this.get('element'));
    if (textBeforeSelection) return; // Navigate within this element
    evt.stopPropagation();
    evt.preventDefault();
    this.get('onNavigateLeft')(this.get('block'));
  },

  /**
   * Called when the user wishes to navigate their cursor right.
   *
   * We analyze the position of the cursor and either let the default navigation
   * occur or manually navigate to the start of the next block.
   *
   * @method
   * @param {Event} evt The event fired
   */
  navigateRight(evt) {
    const { textAfterSelection } =
      TextManipulation.getManipulation(this.get('element'));
    if (textAfterSelection) return; // Navigate within this element
    evt.stopPropagation();
    evt.preventDefault();
    this.get('onNavigateRight')(this.get('block'));
  },

  /**
   * Called when the user wishes to navigate their cursor up.
   *
   * We analyze the position of the cursor and either let the default navigation
   * occur or manually navigate to the previous block.
   *
   * @method
   * @param {Event} evt The event fired
   */
  navigateUp(evt) {
    const contentTop = this.getElementRect().top;
    const rangeRect = this.get('currentRangeRect');
    const distanceFromTop = rangeRect.top - contentTop;
    if (distanceFromTop > 10) return; // Navigate within this element
    evt.stopPropagation();
    evt.preventDefault();
    this.get('onNavigateUp')(this.get('block'), rangeRect);
  },

  /**
   * Called when the user wishes to create a new block at the selection "split".
   *
   * This is typically the case when the user presses the "Return" key and
   * expects the selection to be deleted, the text before the selection to
   * remain where it is, and the text after the selection to move to a line
   * block.
   *
   * @method
   */
  newBlockAtSplit() {
    const { textBeforeSelection, textAfterSelection } =
      TextManipulation.getManipulation(this.get('element'));

    this.setBlockContentFromInput(textBeforeSelection, false);
    this.newBlockInsertedLocally(textAfterSelection);
  },

  /**
   * Render the contents of the associated block.
   *
   * Because contenteditable elements collapse when they have no content, the
   * default content is "<br>". This is not a normal Ember template because
   * editing of text by a user destroys Ember bindings. Instead, we listen for
   * DOM events and update the underlying model based on user changes.
   *
   * @method
   * @observer editedContent
   * @on didInsertElement
   */
  renderBlockContent: observer('editedContent', on('didInsertElement',
    function renderBlockContent() {
      if (this.get('isUpdatingBlockContent')) return;

      const content = getWithDefault(this, 'editedContent', '');

      if (!content) {
        this.$().html('<br>');
        return;
      }

      if (!isFirefox && this.get('usesMarkdown')) {
        const html = highlight(content);
        this.$().html(html);
        this.linkifyLinks();
      } else {
        this.$().text(content);
      }
    })),

  /**
   * Turn any Markdown links or plain URLs into actual links.
   *
   * @method
   */
  linkifyLinks() {
    this.$('.md-url').each(function() {
      Ember.$(this).wrap(`<a href="${this.textContent}">`);
    });

    this.$('.md-link').each(function() {
      const href = Ember.$(this).find('.md-href').text();
      Ember.$(this).wrap(`<a href="${href}">`);
    });
  },

  /**
   * Handle a select-all event.
   *
   * If the user already has "all" selected, tell the editor to do a multi-block
   * select all.
   *
   * @method
   * @param {jQuery.Event} evt The `keydown` event
   */
  selectAll(evt) {
    const element = this.get('element');
    const range = this.get('currentRange');

    if (range.startContainer === element.firstChild &&
        range.startOffset === 0 &&
        range.endContainer === element.lastChild &&
        range.endOffset === element.lastChild.data.length) {
      evt.preventDefault();
      this.get('onDoubleSelectAll')();
    }
  },

  /**
   * Set the block's content based on user input.
   *
   * We sometimes wrap in `isUpdatingBlockContent = true` to prevent Ember
   * rendering after we set "content" from an input event. This is undesirable,
   * however, after the user hits "Return".
   *
   * @method
   * @param {string} content The new content for the block
   * @param {boolean} preventRerender Whether to prevent rerenders
   */
  setBlockContentFromInput(content, preventRerender = true) {
    if (preventRerender) { this.set('isUpdatingBlockContent', true); }
    this.set('block.lastContent', this.get('editedContent'));
    this.set('editedContent', content);
    if (preventRerender) { this.set('isUpdatingBlockContent', false); }
    this.blockContentUpdatedLocally();
  }
});
