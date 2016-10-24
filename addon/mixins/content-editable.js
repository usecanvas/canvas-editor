import Ember from 'ember';
import Selection from 'canvas-editor/mixins/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import { highlight } from 'canvas-editor/lib/markdown/parser';

const { computed, observer, on } = Ember;

/**
 * A mixin for including text content in a canvas that is user-editable.
 *
 * @class CanvasEditor.ContentEditableMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create(Selection, SelectionState, {
  attributeBindings: ['contentEditable:contenteditable'],
  contentEditable: computed.readOnly('editingEnabled'),
  isUpdatingBlockContent: false,

  selection: computed(function() {
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
   * React to an "input" event, where the user has changed content in the DOM.
   *
   * @method
   */
  input() {
    const element = this.get('element');
    const text = element.innerText || element.textContent;
    this.setBlockContentFromInput(text);
    this.get('selection').capture();
    this.renderBlockContent();
    this.get('selection').restore();
  },

  /**
   * React to a "keydown" event.
   *
   * @method
   * @param {Event} evt The event fired
   */
  keyDown(evt) {
    switch (evt.originalEvent.key || evt.originalEvent.keyCode) {
    case 'ArrowLeft':
    case 37:
      this.navigateLeft(evt);
      break;
    case 'ArrowUp':
    case 38:
      this.navigateUp(evt);
      break;
    case 'ArrowRight':
    case 39:
      this.navigateRight(evt);
      break;
    case 'ArrowDown':
    case 40:
      this.navigateDown(evt);
      break;
    case 'Backspace':
    case 8:
      this.backspace(evt);
      break;
    case 'Enter':
    case 13:
      if (evt.shiftKey) return;
      evt.stopPropagation();
      evt.preventDefault();
      this.newBlockAtSplit();
      break;
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
    evt.preventDefault();
    const text = evt.originalEvent.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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
   * @observer block.content
   * @on didInsertElement
   */
  renderBlockContent: observer('block.content', on('didInsertElement',
    function renderBlockContent() {
      if (this.get('isUpdatingBlockContent')) return;

      const content = this.get('block.content');
      const html = highlight(content);

      if (content) {
        this.$().html(html);
        this.linkifyLinks();
      } else {
        this.$().html('<br>');
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
   * Set the block's content based on user input.
   *
   * We sometimes wrap in `isUpdatingBlockContent = true` to prevent Ember
   * rendering after we set "content" from an input event. This is undesirable,
   * however, after the user hits "Return".
   *
   * @method
   * @param {string} content The new content for the block
   * @param {boolean} preventRerender Whehter to prevent rerenders
   */
  setBlockContentFromInput(content, preventRerender = true) {
    if (preventRerender) { this.set('isUpdatingBlockContent', true); }
    this.set('block.lastContent', this.get('block.content'));
    this.set('block.content', content);
    if (preventRerender) { this.set('isUpdatingBlockContent', false); }
    this.blockContentUpdatedLocally();
  }
});
