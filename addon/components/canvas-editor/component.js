import CopyPaste from 'canvas-editor/lib/copy-paste';
import Ember from 'ember';
import Key from 'canvas-editor/lib/key';
import MultiBlockSelect from 'canvas-editor/lib/multi-block-select';
import RSVP from 'rsvp';
import Rangy from 'rangy';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Selection from 'canvas-editor/lib/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import TypeChanges from 'canvas-editor/mixins/type-changes';
import filterBlocks from 'canvas-editor/lib/filter-blocks';
import flattenBy from 'canvas-editor/lib/flatten-by';
import layout from './template';
import nsEvent from 'canvas-editor/lib/ns-event';
import styles from './styles';
import testTemplates from 'canvas-editor/lib/templates';
import { caretRangeFromPoint } from 'canvas-editor/lib/range-polyfill';

import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import List from 'canvas-editor/lib/realtime-canvas/list';
import Upload from 'canvas-editor/lib/realtime-canvas/upload';

const { $, computed, inject, observer, on, run } = Ember;
const CARD_BLOCK_SELECTED_ATTR = 'data-card-block-selected';
const MULTI_BLOCK_EVENTS = 'keydown keypress keyup'.w();
const SELECT_BLOCK = '.canvas-block';
const SELECT_CARD_BLOCK = '.canvas-block-card';
const SELECT_EDITABLE = '.canvas-block-editable';

/**
 * A component for editing a CanvasEditor.RealtimeCanvas.
 *
 * ## Architecture
 *
 * This component comprises multiple smaller "block" components that represent
 * chunks of a canvas, such as paragraphs, lists, list items, or URL cards.
 *
 * ## Event Handling/Bubbling
 *
 * As much as possible, these components intercept their own events and only
 * bubble up to the editor when work that affects the canvas outside of
 * themselves is necessary.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(TypeChanges, {
  /*
   * SIMPLE PROPERTIES
   * =================
   */

  /**
   * @member {Array<CanvasEditor.RealtimeCanvas.Block>} Shortcut to blocks
   */
  blocks: computed.readOnly('canvas.blocks'),

  /**
   * @member {number} A counter to increment when cards load (for computed prop)
   */
  cardLoadIndex: 0,

  /**
   * @member {Array<string>} Non-localized class names for debugging
   */
  classNames: 'canvas-editor'.w(),

  comments: computed(_ => []),

  /**
   * @member {Ember.Service} A service for tracking ID of the insert-after block
   */
  dropBar: inject.service(),

  /**
   * @member {boolean} Whether editing is enabled in the component
   */
  editingEnabled: true,

  /**
   * @member {string} A term used to filter the canvas's blocks
   */
  filterTerm: '',

  /**
   * @member {boolean} Whether a multi-block selection is in progress
   */
  isMultiBlock: computed.readOnly('multiBlockSelect.isSelecting'),

  /**
   * @member {object} The component layout template
   */
  layout,

  /**
   * @member {Array<string>} Localized class names for styling
   */
  localClassNames: 'canvas-editor'.w(),

  /**
   * @member {?CanvasEditor.MultiBLockSelect} A manager for multi-block select
   */
  multiBlockSelect: null,

  /**
   * @member {object} The component styles
   */
  styles,

  /*
   * COMPUTED PROPERTIES
   * ===================
   */

  /**
   * @member {Array<CanvasEditor.RealtimeCanvas.Block>} The visible content
   *   blocks of the canvas, filtered by a filter term
   */
  contentBlocks: computed('blocks.[]', 'cardLoadIndex', 'filterTerm',
    function() {
      return filterBlocks(
        this.get('blocks').slice(1), this.get('filterTerm'));
    }),

  /**
   * @member {boolean} Whether the canvas has non-title content.
   */
  hasContent: computed('blocks.[]', function() {
    switch (this.get('blocks.length')) {
    case 0:
      return false;
    case 1:
      return false;
    case 2:
      return this.get('blocks').objectAt(1).get('content') !== '';
    default:
      return true;
    }
  }),

  /**
   * The block to focus on when the canvas first renders
   *
   * This is either a user-supplied query parameter or the first block in the
   * canvas (typically the title).
   *
   * @member {CanvasEditor.RealtimeCanvas.Block}
   */
  initialFocusBlock: computed('blocks.[]', function() {
    const id = (window.location.search.match(/block=(\w{22})/) || [])[1];
    const blocks = this.getNavigableBlocks();
    const block = blocks.findBy('id', id);
    return block || blocks.get('firstObject');
  }),

  /**
   * @member {?Element} The currently selected card block
   */
  selectedCardBlock: computed(function() {
    const elem = this.get('selectedCardBlockElement');
    return elem && this.getBlockForElement(elem);
  }).volatile(),

  /**
   * @member {?Element} The currently selected card block element
   */
  selectedCardBlockElement: computed(function() {
    return this.$(`[${CARD_BLOCK_SELECTED_ATTR}=true]`)[0] || null;
  }).volatile(),

  /**
   * @member {CanvasEditor.RealtimeCanvas.TitleBlock} The canvas's title block
   */
  titleBlock: computed.readOnly('blocks.firstObject'),

  /*
   * METHODS
   * =======
   */

  /*
   * Observers
   * ---------
   */

  /**
   * Observer called when a canvas's fill template changes in order to apply
   * the template to the canvas.
   *
   * @method
   */
  onCanvasTemplateChange: observer('canvas.fillTemplate', function() {
    if (!this.get('canvas.fillTemplate')) return;
    this.send('templateApply', this.get('canvas.fillTemplate'));
  }),

  /*
   * DOM Event Hooks
   * ---------------
   */

  /**
   * Handle the `beforeunload` event, preventing the window from closing if
   * there are file uploads in progress.
   *
   * @method
   * @param {Event} evt The `beforeunload` event
   */
  beforeUnload(_evt) {
    if (this.get('blocks').any(block => block.get('file'))) return true;
    return null;
  },

  /**
   * Handle the `click` event on the component.
   *
   * @method
   * @param {jQuery.Event} evt The `click` event
   */
  click(evt) {
    const $target = this.$(evt.target);
    const $cardBlock = $target.closest(SELECT_CARD_BLOCK);

    if ($cardBlock.length && evt.target.tagName !== 'A') {
      this.blurEditor();
      const cardBlock = this.getBlockForElement($cardBlock[0]);
      this.selectCardBlock(cardBlock);
    } else if (evt.metaKey && evt.shiftKey) {
      this.get('onMetaSelectText')(evt);
    }
  },

  /**
   * Handle the `click` event on the document.
   *
   * @method
   * @param {jQuery.Event} evt The `click` event
   */
  clickDocument(evt) {
    if (!this.get('element').contains(evt.target)) this.blurEditor();
  },

  /**
   * Handle a `copy` event when in the document.
   *
   * @method
   * @param {jQuery.Event} evt The `copy` event
   */
  copyDocument(evt) {
    const selectedBlocks = this.getSelectedBlocks()
      .concat(this.get('selectedCardBlock')).compact();
    const copyBlocks = this.buildCopyBlocks(selectedBlocks);
    if (!copyBlocks.length) return;
    const copyPaste = new CopyPaste(evt);
    copyPaste.copyBlocksToClipboard(copyBlocks);
  },

  /**
   * Handle a `copy` event when in multi-block.
   *
   * @method
   * @param {jQuery.Event} evt The `copy` event
   */
  copyMultiBlock(_evt) {
    Ember.K();
  },

  /**
   * Handle a `cut` event when in multi-block.
   *
   * @method
   * @param {jQuery.Event} evt The `cut` event
   */
  cutDocument(evt) {
    this.copyDocument(evt);

    if (!this.get('editingEnabled')) return;

    const [first, ...rest] = this.getSelectedBlocks()
      .concat(this.get('selectedCardBlock')).compact();
    let focusBlock;

    if (!first) return;
    if (first.get('type') === 'title') {
      focusBlock = first;
      first.set('isSelected', false);
      this.updateBlockContent(first, '');
      this.get('onBlockContentUpdatedLocally')(first);
    } else {
      focusBlock = Paragraph.create({});
      this.insertBlockAfter(focusBlock, first);
      this.removeBlock(first);
    }
    rest.forEach(block => this.removeBlock(block));
    this.get('multiBlockSelect').deSelectAll();
    run.scheduleOnce('afterRender', this, 'focusBlockStart', focusBlock);
  },

  /**
   * Handle the `dragenter` event.
   *
   * @method
   * @param {jQuery.Event} evt The `dragenter` event
   */
  dragEnter(_evt) {
    this.$('*').css('pointer-events', 'none');
  },

  /**
   * Handle the `dragleave` event.
   *
   * @method
   * @param {jQuery.Event} evt The `dragleave` event
   */
  dragLeave(_evt) {
    this.$('*').css('pointer-events', 'auto');
    this.set('dropBar.insertAfter', null);
  },

  /**
   * Handle the `dragover` event by calling `dragOverFile` if user is dragging a
   * file.
   *
   * @method
   * @param {jQuery.Event} evt The `dragover` event
   */
  dragOver(evt) {
    const { clientX, clientY, dataTransfer: { types } } = evt;
    if (!Array.from(types).includes('Files')) return;
    evt.preventDefault();
    this.dragOverFile(clientX, clientY);
  },

  /**
   * Handle the `drop` event by calling `dropFile` if the user is dropping a
   * file.
   *
   * @method
   * @param {jQuery.Event} evt The `drop` event
   */
  drop(evt) {
    this.$('*').css('pointer-events', 'auto');
    const { dataTransfer: { files } } = evt;
    if (files[0]) this.dropFile(evt, files[0]);
  },

  /**
   * Handle the `focus` event on editable blocks by de-focusing card blocks.
   *
   * @method
   * @param {jQuery.Event} evt The `focus` event
   */
  focusCanvasBlockEditable(_evt) {
    const attribute = CARD_BLOCK_SELECTED_ATTR;
    this.$(`[${attribute}=true]`).attr(attribute, false);
  },

  /**
   * Handle the `keydown` event on the document.
   *
   * @method
   * @param {jQuery.Event} evt The `keydown` event
   */
  keydownDocument(evt) {
    if (!this.get('editingEnabled')) return;

    const selectedCardBlockElement = this.get('selectedCardBlockElement');
    const key = new Key(evt.originalEvent);

    if (key.key === 'esc' &&
        (this.eventTargetInEditor(evt) || selectedCardBlockElement)) {
      this.blurEditor();
      return;
    }

    if (key.is('meta', 'z')) {
      this.send('undo', evt);
      return;
    } else if (key.is('meta', 'shift', 'z')) {
      this.send('redo', evt);
      return;
    } else if (key.is('meta', 'ctrl', 'up') && selectedCardBlockElement) {
      evt.preventDefault();
      const block = this.getNavigableBlocks()
        .findBy('id', selectedCardBlockElement.id);
      this.send('swapBlockUp', block);
    } else if (key.is('meta', 'ctrl', 'down') && selectedCardBlockElement) {
      evt.preventDefault();
      const block = this.getNavigableBlocks()
        .findBy('id', selectedCardBlockElement.id);
      this.send('swapBlockDown', block);
    }

    // Below handles only navigation/editing of card blocks.
    if (!selectedCardBlockElement) return;
    this.keydownCard(evt, selectedCardBlockElement);
  },

  /**
   * Handle the `keydown` event when it happens on a card.
   *
   * @method
   */
  keydownCard(evt, selectedCardBlockElement) {
    const cardBlock = this.getBlockForElement(selectedCardBlockElement);
    const key = new Key(evt.originalEvent);

    if (key.is('up') || key.is('left')) {
      evt.preventDefault();
      selectedCardBlockElement.setAttribute(CARD_BLOCK_SELECTED_ATTR, false);
      this.send('navigateUp', cardBlock);
    } else if (key.is('down') || key.is('right')) {
      if (!this.blockAfter(cardBlock)) return;
      evt.preventDefault();
      selectedCardBlockElement.setAttribute(CARD_BLOCK_SELECTED_ATTR, false);
      this.send('navigateDown', cardBlock);
    } else if (key.is('backspace')) {
      evt.preventDefault();
      selectedCardBlockElement.setAttribute(CARD_BLOCK_SELECTED_ATTR, false);
      this.send('navigateUp', cardBlock);
      this.send('blockDeletedLocally', cardBlock, null, { onlySelf: true });
    } else if (key.is('return')) {
      evt.preventDefault();
      this.send('newBlockInsertedLocally', cardBlock, Paragraph.create());
    }
  },

  /**
   * Handle the `keydown` event when in multi-block.
   *
   * @method
   * @param {jQuery.Event} evt The `keydown` event
   */
  /* eslint-disable max-statements */
  keydownMultiBlock(evt) {
    const key = new Key(evt.originalEvent);

    if (key.key === 'esc') {
      evt.preventDefault();
      this.cancelMultiBlockSelect();
    } else if (key.key === 'backspace') {
      evt.preventDefault();
      this.replaceMultiBlockSelect('');
    } else if (key.is('shift', 'up')) {
      evt.preventDefault();
      this.get('multiBlockSelect').selectUp();
    } else if (key.is('shift', 'down')) {
      evt.preventDefault();
      this.get('multiBlockSelect').selectDown();
    } else if (key.is('up')) {
      evt.preventDefault();
      this.get('multiBlockSelect').collapse(true).shiftUp();
    } else if (key.is('down')) {
      evt.preventDefault();
      this.get('multiBlockSelect').collapse().shiftDown();
    } else if (key.is('meta', 'shift', 'up')) {
      evt.preventDefault();
      this.get('multiBlockSelect').selectToStart();
    } else if (key.is('meta', 'shift', 'down')) {
      evt.preventDefault();
      this.get('multiBlockSelect').selectToEnd();
    } else if (key.is('meta', 'a')) {
      evt.preventDefault();
      this.get('multiBlockSelect').selectAll();
    } else if (key.meta) {
      // Insert temporary element to catch clipboard events for Safari & FF
      this.insertTempElem();
    }
  },

  /**
   * Handle the `keypress` event when in multi-block.
   *
   * @method
   * @param {jQuery.Event} evt The `keypress` event
   */
  keypressMultiBlock(evt) {
    if (!evt.metaKey) {
      evt.preventDefault();
      const content = evt.char || String.fromCharCode(evt.charCode);
      this.replaceMultiBlockSelect(content);
    }
  },

  /**
   * Handle the `keyup` event for the document.
   *
   * @method
   * @param {jQuery.Event} evt The `keyup` event
   */
  keyupDocument(_evt) {
    if (this._$tempElem) {
      this._$tempElem.remove();
      this._$tempElem = null;
    }
  },

  /**
   * Handle the `keyup` event when in multi-block.
   *
   * @method
   * @param {jQuery.Event} evt The `keyup` event
   */
  keyupMultiBlock(_evt) {
    Ember.K();
  },

  /**
   * Ignore `mousedown` events with meta+shift for filter word selection.
   *
   * @method
   * @param {jQuery.Event} evt The `mousedown` event
   */
  mouseDown(evt) {
    if (evt.metaKey && evt.shiftKey) evt.preventDefault();
  },

  /**
   * Handle the `paste` event that is bubbled up to document.
   *
   * This should only fire when >= 1 blocks is selected (not when selected
   * inside a block).
   *
   * @method
   * @param {jQuery.Event} evt The `paste` event
   */
  pasteDocument(evt) {
    const blocks = this.getNavigableBlocks();
    const { pastedLines } = new CopyPaste(evt);
    const selectedBlocks = blocks.filterBy('isSelected', true)
      .concat(this.get('selectedCardBlock')).compact();

    if (!selectedBlocks.length || !pastedLines) return;

    evt.preventDefault();

    const firstSelectedType = selectedBlocks[0].get('type');
    const firstPastedType = pastedLines[0].get('type');

    if (firstSelectedType === 'title' && firstPastedType !== 'title') {
      selectedBlocks[0].set('isSelected', false);
      selectedBlocks.replace(0, 1, []);
    } else if (firstSelectedType !== 'title' && firstPastedType === 'title') {
      const newLine = Heading.create(pastedLines[0].getProperties('content'));
      pastedLines.replace(0, 1, [newLine]);
    }

    pastedLines.reverse();
    const after = selectedBlocks.get('lastObject');
    pastedLines.forEach(block => this.insertBlockAfter(block, after));
    selectedBlocks.forEach(block => this.removeBlock(block));

    const focusBlock = pastedLines.get('firstObject.blocks.lastObject') ||
      pastedLines.get('firstObject');
    if (focusBlock.get('isCard')) {
      run.scheduleOnce('afterRender', this, 'selectCardBlock', focusBlock);
    } else {
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
    }
  },

  /**
   * Handle the `paste` event when in multi-block.
   *
   * @method
   * @param {jQuery.Event} evt The `paste` event
   */
  pasteMultiBlock(_evt) {
    Ember.K();
  },

  /*
   * Lifecycle Hooks
   * ---------------
   */

  /**
   * Bind a handler for the `window.onbeforeunload` event.
   *
   * @method
   */
  bindBeforeunload: on('didInsertElement', function() {
    window.onbeforeunload = this.beforeUnload.bind(this);
  }),

  /**
   * Bind handlers for document-level `click` events.
   *
   * @method
   */
  bindClickEvents: on('didInsertElement', function() {
    Ember.$(document).on(
      nsEvent('click', this),
      run.bind(this, 'clickDocument'));
  }),

  /**
   * Bind handlers for document-level `copy` events.
   *
   * @method
   */
  bindCopyPasteEvents: on('didInsertElement', function() {
    Ember.$(document).on(
      nsEvent('copy', this),
      run.bind(this, 'copyDocument'));
    Ember.$(document).on(
      nsEvent('cut', this),
      run.bind(this, 'cutDocument'));
    Ember.$(document).on(
      nsEvent('paste', this),
      run.bind(this, 'pasteDocument'));
  }),

  /**
   * Bind handlers for document-level `focus` events.
   *
   * @method
   */
  bindFocusEvents: on('didInsertElement', function() {
    Ember.$(document).on(
      nsEvent('focus', this),
      '.canvas-block-editable',
      run.bind(this, 'focusCanvasBlockEditable'));
  }),

  /**
   * Bind handlers for document-level `keydown` events.
   *
   * @method
   */
  bindKeyDownEvents: on('didInsertElement', function() {
    Ember.$(document).on(
      nsEvent('keydown', this),
      run.bind(this, 'keydownDocument'));
  }),

  /**
   * Bind handlers for document-level `keyup` events.
   *
   * @method
   */
  bindKeyUpEvents: on('didInsertElement', function() {
    Ember.$(document).on(
      nsEvent('keyup', this),
      run.bind(this, 'keyupDocument'));
  }),

  /**
   * Bind handlers for events fired while in the multi-block state.
   *
   * @method
   */
  bindMultiBlockEvents: on('didInsertElement', function() {
    // Bind a document-level event to this component
    const self = this;

    // Bind a document-level event to this component
    function documentBind(evtName) {
      Ember.$(document).on(nsEvent(evtName, self),
        multiBlockWrap(self[`${evtName}MultiBlock`].bind(self)));
    }

    // Return a function that executes a function only if `isMultiBlock`
    function multiBlockWrap(func) {
      return function _multiBlockWrapped(evt) {
        run(_ => {
          if (self.get('isMultiBlock')) return func(evt);
          return null;
        });
      };
    }

    MULTI_BLOCK_EVENTS.forEach(evtName => documentBind(evtName));
  }),

  /**
   * Focus on the initial focus block.
   *
   * @method
   */
  focusInitialBlock: on('didInsertElement', function() {
    run.next(_ => {
      if (!(this.get('element') && this.get('editingEnabled'))) return;

      const focusBlock = this.get('initialFocusBlock');

      if (focusBlock.get('isCard')) {
        this.selectCardBlock(focusBlock);
      } else {
        this.focusBlockStart(focusBlock);
      }
    });
  }),

  /**
   * Initialize the multi-block selection manager.
   *
   * @method
   */
  initMultiSelectManager: on('didInsertElement', function() {
    this.set('multiBlockSelect', MultiBlockSelect.create({
      element: this.get('element'),
      canvas: this.get('canvas')
    }));
  }),

  /**
   * Teardown the multi-block selection manager.
   *
   * @method
   */
  teardownMultiSelectManager: on('willDestroyElement', function() {
    this.get('multiBlockSelect').teardown();
  }),

  /**
   * Teardown the temporary element if it exists.
   *
   * @method
   */
  teardownTempElem: on('willDestroyElement', function() {
    if (this._$tempElem) {
      this._$tempElem.remove();
      this._$tempElem = null;
    }
  }),

  /**
   * Unbind document-level handlers.
   *
   * @method
   */
  unbindDocumentEvents: on('willDestroyElement', function() {
    Ember.$(document).off(`.${Ember.guidFor(this)}`);
  }),

  /**
   * Unbind the beforeunload handler.
   *
   * @method
   */
  unbindBeforeunload: on('willDestroyElement', function() {
    window.onbeforeunload = null;
  }),

  /**
   * Unbind the multi-block event handlers.
   *
   * @method
   */
  unbindMultiBlockVariants: on('willDestroyElement', function() {
    MULTI_BLOCK_EVENTS.forEach(evtName => {
      Ember.$(document).off(nsEvent(evtName, this));
    });
  }),

  /*
   * Regular Methods
   * ---------------
   */

  /**
   * Get the block after the given block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to get the block
   *   after
   * @returns {?CanvasEditor.RealtimeCanvas.Block} The block after `block`
   */
  blockAfter(block) {
    const blocks = this.getNavigableBlocks();
    const blockIdx = blocks.indexOf(block);
    return blocks.objectAt(blockIdx + 1) || null;
  },

  /**
   * Get the block before the given block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to get the block
   *   before
   * @returns {?CanvasEditor.RealtimeCanvas.Block} The block after `block`
   */
  blockBefore(block) {
    const blocks = this.getNavigableBlocks();
    const blockIdx = blocks.indexOf(block);
    return blocks.objectAt(blockIdx - 1) || null;
  },

  /**
   * "Blur" the editor by de-selecting card blocks and blurring any editable
   * blocks.
   *
   * @method
   */
  blurEditor() {
    const selectedCardBlockElement = this.get('selectedCardBlockElement');

    if (selectedCardBlockElement) {
      selectedCardBlockElement.setAttribute(CARD_BLOCK_SELECTED_ATTR, false);
    } else {
      this.$(':focus').blur();
    }
  },

  /**
   * Construct an array of blocks to serialize to the clipboard
   *
   * @method
   */
  buildCopyBlocks(blocks) {
    return blocks.reduce((prev, next) => {
      if (next.get('parent') && prev.get('lastObject.isGroup')) {
        prev.get('lastObject.blocks').pushObject(next);
      } else if (next.get('parent')) {
        const lst = List.create({ blocks: [] });
        lst.get('blocks').pushObject(next);
        prev.pushObject(lst);
      } else {
        prev.pushObject(next);
      }
      return prev;
    }, []);
  },

  /**
   * Cancel a multi-block selection by de-selecting and focusing on the first
   * block in the selection.
   *
   * @method
   */
  cancelMultiBlockSelect() {
    const focusBlock = this.getSelectedBlocks().objectAt(0);

    this.get('multiBlockSelect').deSelectAll();

    if (!focusBlock) return;

    if (focusBlock.get('isCard')) {
      run.scheduleOnce('afterRender', this, 'selectCardBlock', focusBlock);
    } else {
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
    }
  },

  /**
   * Handle the user dragging a file over the editor by setting the
   * `insertAfter` ID on the `dropBar` service.
   *
   * @method
   * @param {number} x The X coordinate of the drag event
   * @param {number} y The Y coordinate of the drag event
   */
  dragOverFile(x, y) {
    if (!this.get('editingEnabled')) return;

    const range = caretRangeFromPoint(x, y);
    if (!range) return;
    const $block = this.$(range.startContainer).closest(SELECT_BLOCK);
    if (!$block[0]) return;
    const { top, height } = $block[0].getBoundingClientRect();
    const shouldInsertAfter = y - top > height / 2;
    const id = $block.attr('id');

    if (shouldInsertAfter) {
      this.set('dropBar.insertAfter', id);
    } else {
      const blocks = this.getNavigableBlocks();
      const idx = blocks.indexOf(blocks.findBy('id', id));
      const newId = blocks.objectAt(Math.max(0, idx - 1)).get('id');
      this.set('dropBar.insertAfter', newId);
    }
  },

  /**
   * Handle the user dropping a file onto the editor.
   *
   * @method
   * @param {jQuery.Event} evt The `drop` event
   * @param {File} file The dropped file
   */
  dropFile(evt, file) {
    if (!this.get('editingEnabled')) return;

    evt.preventDefault();
    const blocks = this.getNavigableBlocks();
    const insertAfterID = this.get('dropBar.insertAfter');
    const insertAfterBlock = blocks.findBy('id', insertAfterID);
    const uploadBlock =
      Upload.create({ file, meta: { filename: file.name, progress: 0 } });

    this.set('dropBar.insertAfter', null);

    if (insertAfterBlock) {
      this.insertBlockAfter(uploadBlock, insertAfterBlock);
    }
  },

  /**
   * Determine whether an event's target was within the editor.
   *
   * An event is always considered "in the editor" if a card block is selected.
   *
   * @method
   * @param {jQuery.Event} evt The event whose target to test
   * @returns {boolean} Whether the event's target was within the editor
   */
  eventTargetInEditor(evt) {
    return this.get('element').contains(evt.target);
  },

  /**
   * Focus the given block, manipulating the range with a function.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to focus on
   * @param {Function} func The function to manipulate the range with
   */
  focusBlock(block, func) {
    let $block = this.$(this.getElementForBlock(block));
    const $editable = $block.find(SELECT_EDITABLE);
    if ($editable.length) $block = $editable;
    const focusElement = $block[0];
    const range = Rangy.createRange();
    func(range, focusElement);
    Rangy.getSelection().setSingleRange(range);
    $block.focus();
    Selection.scrollTo(focusElement);
  },

  /**
   * Focus at the end of the block's element.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to focus on
   */
  focusBlockEnd(block) {
    this.focusBlock(block, (range, focusElement) => {
      if (block.get('content') === '') {
        range.setStart(focusElement, 0);
      } else {
        range.setStart(focusElement, focusElement.childNodes.length);
      }
    });
  },

  /**
   * Focus at the beginning of the block's element.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to focus on
   */
  focusBlockStart(block) {
    this.focusBlock(block, (range, focusElement) => {
      range.setStart(focusElement, 0);
    });
  },

  /**
   * Get the block associated with an element.
   *
   * @method
   * @param {Element} element The element to get the block for
   * @returns {CanvasEditor.RealtimeCanvas.Block} The block for the element
   */
  getBlockForElement(element) {
    return this.get('blocks').findBy('id', element.id);
  },

  /**
   * Get the element for the given block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to get the
   *   element for
   * @returns {Element} The element for the block
   */
  getElementForBlock(block) {
    return this.$(`#${block.get('id')}`)[0];
  },

  /**
   * Get a flattened list of the canvas's blocks, replacing list blocks with
   * their child blocks.
   *
   * @method
   * @returns {Array<CanvasEditor.RealtimeCanvas.Block>}
   */
  getNavigableBlocks() {
    return flattenBy(this.get('blocks'), 'isGroup', 'blocks');
  },

  /**
   * Get the multi-block selected blocks.
   *
   * @method
   * @returns {Array<CanvasEditor.RealtimeCanvas.Block>}
   */
  getSelectedBlocks() {
    return this.getNavigableBlocks().filterBy('isSelected');
  },

  /**
   * Insert a block after another block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} newBlock The inserted block
   * @param {CanvasEditor.RealtimeCanvas.Block} beforeBlock The block before the
   *   inserted block
   */
  insertBlockAfter(newBlock, beforeBlock) {
    if (beforeBlock.get('parent') &&
        beforeBlock.get('parent.type') === newBlock.get('type')) {
      newBlock.get('blocks').slice(0).reverse().forEach(block => {
        this.insertBlockAfter(block, beforeBlock);
      });
      return;
    }

    if (beforeBlock.get('parent') &&
        beforeBlock.get('parent.type') !== newBlock.get('parent.type')) {
      this.splitGroupAtBlock(beforeBlock, newBlock, false);
      return;
    }

    let parentBlocks;

    if (beforeBlock.get('parent')) {
      parentBlocks = beforeBlock.get('parent.blocks');
      newBlock.set('parent', beforeBlock.get('parent'));
    } else {
      parentBlocks = this.get('blocks');
    }

    const idx = parentBlocks.indexOf(beforeBlock);
    parentBlocks.replace(idx + 1, 0, [newBlock]);
    this.get('onNewBlockInsertedLocally')(idx + 1, newBlock);
  },

  /**
   * Insert temporary element to capture clipboard events in Safari & FF.
   *
   * @method
   */
  insertTempElem() {
    const $temp = $('<input style="position:absolute;left:-999px;">');
    $(document.body).append($temp);
    $temp.focus();
    $temp.val('temp').select();
    this._$tempElem = $temp;
  },

  /**
   * Navigate the user horizontally.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to navigate from
   * @param {string} direction The direction (`"Left"` or `"Right"`) to navigate
   *   in
   */
  navigateHorizontal(block, direction) {
    let targetBlock;

    if (direction === 'Left') {
      targetBlock = this.blockBefore(block);
    } else {
      targetBlock = this.blockAfter(block);
    }

    if (!targetBlock) return;

    if (targetBlock.get('isCard')) {
      this.selectCardBlock(targetBlock);
    } else {
      const focusMethod =
        direction === 'Left' ? 'focusBlockEnd' : 'focusBlockStart';
      run.scheduleOnce('afterRender', this, focusMethod, targetBlock);
    }
  },

  /**
   * Navigate the user vertically.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to navigate from
   * @param {ClientRect} rangeRect The client rect for the current user range
   * @param {string} direction The direction (`"Up"` or `"Down"`) to navigate in
   */
  navigateVertical(block, rangeRect, direction) {
    let targetBlock;

    if (direction === 'Up') {
      targetBlock = this.blockBefore(block);
    } else {
      targetBlock = this.blockAfter(block);
    }

    if (!targetBlock) return;

    if (targetBlock.get('isCard')) {
      this.selectCardBlock(targetBlock);
    } else if (block.get('isCard')) {
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', targetBlock);
    } else {
      Selection[`navigate${direction}ToBlock`](
        this.$(), targetBlock, rangeRect);
    }
  },

  /**
   * Remove a block from the canvas.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to remove
   * @param {boolean} removeParent Whether to remove the block's parent—this is
   *   sometimes undesirable as we may be remove it manually later
   */
  removeBlock(block, removeParent = true) {
    if (block.get('parent')) {
      const idx = block.get('parent.blocks').indexOf(block);
      block.get('parent.blocks').removeObject(block);
      this.get('onBlockDeletedLocally')(idx, block);
      if (removeParent) this.removeGroupIfEmpty(block.get('parent'));
    } else {
      const idx = this.get('blocks').indexOf(block);
      this.get('blocks').removeObject(block);
      this.get('onBlockDeletedLocally')(idx, block);
    }
  },

  /**
   * Remove a group from the canvas if it is empty.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.GroupBlock} group The group that will
   *   be removed if empty
   */
  removeGroupIfEmpty(group) {
    if (group.get('blocks.length') > 0) return;
    this.removeBlock(group);
  },

  /**
   * Replace multi-block select with a string.
   *
   * @method
   * @param {string} content The string to replace the selection with
   */
  replaceMultiBlockSelect(content) {
    let focusBlock;

    if (!this.get('editingEnabled')) return;

    this.getSelectedBlocks().forEach((block, i) => {
      if (i === 0) {
        if (block.get('type') === 'title') {
          this.updateBlockContent(block, content);
          this.send('blockContentUpdatedLocally', block);
          focusBlock = block;
        } else if (block.get('parent')) {
          focusBlock = this.splitGroupWithContent(block, content);
        } else {
          const paragraph = Paragraph.create({ content });
          this.send('blockReplacedLocally', block, paragraph);
          focusBlock = paragraph;
        }
      } else {
        this.send('blockDeletedLocally',
          block, '', { onlySelf: true });
      }
    });

    this.get('multiBlockSelect').deSelectAll();

    if (focusBlock) {
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
    }
  },

  /**
   * Select a card block by blurring any other card blocks and selecting the
   * given block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} cardBlock The card block to
   *   select
   */
  selectCardBlock(cardBlock) {
    this.blurEditor();
    Selection.selectCardBlock(this.$(), cardBlock);
  },

  /**
   * Split a block's parent group at the block, and either replace the block or
   * insert after it.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block whose group will
   *   be split
   * @param {CanvasEditor.CanvasRealtime.Block} insertBlock The block that will
   *   be added in between the two groups
   * @param {boolean} shouldReplace Whether the insertBlock should replace or be
   *   inserted after block
   */
  splitGroupAtBlock(block, insertBlock, shouldReplace) {
    const group = block.get('parent');
    const idx = group.get('blocks').indexOf(block);
    const groupIdx = this.get('blocks').indexOf(group);
    const postSplitBlocks = Ember.A(group.get('blocks').slice(idx + 1));

    // Trigger deletes for the post-split blocks
    postSplitBlocks.forEach(postSplitBlock => {
      this.get('onBlockDeletedLocally')(idx + 1, postSplitBlock);
    });

    // Create new group from post-split blocks
    const postSplitGroup =
      group.constructor.create({ blocks: postSplitBlocks });

    // Remove post-split blocks from original group
    group.get('blocks').replace(idx + 1, Infinity, []);

    if (shouldReplace) this.removeBlock(block, false);

    // Insert & trigger the splitting block
    this.get('blocks').replace(groupIdx + 1, 0, [insertBlock]);
    this.get('onNewBlockInsertedLocally')(groupIdx + 1, insertBlock);

    // Insert & trigger post-split group unless it's empty
    if (postSplitGroup.get('blocks.length')) {
      this.get('blocks').replace(groupIdx + 2, 0, [postSplitGroup]);
      this.get('onNewBlockInsertedLocally')(groupIdx + 2, postSplitGroup);
    }

    this.removeGroupIfEmpty(group);
  },

  /**
   * Split a block's parent group at the block, replacing it with a paragraph.
   *
   * This replaces the block with a new paragraph *of the same ID*.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block whose group will
   *   be split
   * @param {string} content The content for the new block created for the split
   * @returns {CanvasEditor.CanvasRealtime.Block} The new paragraph block
   */
  splitGroupWithContent(block, content) {
    const paragraph = Paragraph.create({ id: block.get('id'), content });
    this.splitGroupAtBlock(block, paragraph, true);
    return paragraph;
  },

  /**
   * Update a block's content to the given value.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block to update
   * @param {string} content The new content
   * @returns {CanvasEditor.CanvasRealtime.Block} The updated block
   */
  updateBlockContent(block, content) {
    block.set('lastContent', block.get('content'));
    block.set('content', content);
    return block;
  },

  /**
   * Called when a block's content was updated in the editor.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} after The blocks that blocks
   * should come after
   * @param {Array<CanvasEditor.CanvasRealtime.Block>} blocks The blocks that
   * will be appended
   */
  pasteBlocksAfter(after, blocks, shouldReplace = false) {
    if (after.get('type') === 'title' && blocks[0].get('type') !== 'title') {
      shouldReplace = false;
    } else if (after.get('type') !== 'title' &&
               blocks[0].get('type') === 'title') {
      const newLine = Heading.create(blocks[0].getProperties('content'));
      blocks.replace(0, 1, [newLine]);
    }

    blocks.reverse().forEach(block => this.insertBlockAfter(block, after));
    if (shouldReplace) {
       this.removeBlock(after);
    }

    const focusBlock = blocks.get('firstObject.blocks.lastObject') ||
      blocks.get('firstObject');
    if (focusBlock.get('isCard')) {
      run.scheduleOnce('afterRender', this, 'selectCardBlock', focusBlock);
    } else {
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
    }
  },

  /*
   * ACTIONS
   * =======
   */

  actions: {
    /**
     * Called when a block's content was updated in the editor.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The updated block
     */
    blockContentUpdatedLocally(block) {
      this.get('onBlockContentUpdatedLocally')(block);
    },

    /**
     * Called when a block is deleted locally.
     *
     * If there is text remaining in the deleted block, it is joined onto the
     * previous block.
     *
     * @param {CanvasEditor.CanvasRealtime.Block} block The deleted block
     * @param {string} remainingContent The remaining content left in the block
     * @param {object} opts Options for deleting the block
     * @param {boolean} opts.onlySelf Only remove the given block, do not join
     *   remaining content
     */
    blockDeletedLocally(block, remainingContent = '', opts = {}) {
      // Do not join remaining content
      if (opts.onlySelf) {
        this.removeBlock(block);
        return;
      }

      const prevBlock = this.blockBefore(block);
      if (!prevBlock) return; // Do not delete the first block

      /*
       * Handle deleting of block *after* a card block. If there is content, it
       * should only select the card block, and delete nothing.
       */
      if (prevBlock.get('isCard')) {
        if (!block.get('content')) {
          this.send('blockDeletedLocally', block, '', { onlySelf: true });
        }

        this.selectCardBlock(prevBlock);
        return;
      }

      /*
       * Capture the selection at the end of the previous block so that we can
       * restore to that position after we've joined the deleted block's
       * remaining content.
       */
      const $prevBlock = this.$(this.getElementForBlock(prevBlock));
      const selectionState =
        new SelectionState($prevBlock.find(SELECT_EDITABLE)[0]);
      this.focusBlockEnd(prevBlock);
      selectionState.capture();
      this.updateBlockContent(
        prevBlock, prevBlock.get('content') + remainingContent);
      this.removeBlock(block);
      this.get('onBlockContentUpdatedLocally')(prevBlock);
      run.scheduleOnce('afterRender', selectionState, 'restore');
    },

    /**
     * Called when a block's meta object was updated in the editor.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The updated block
     * @param {Array<*>} metaPath The path to the updated meta property
     * @param {*} oldValue The old meta value
     * @param {*} newValue The new meta value
     */
    blockMetaReplacedLocally(block, metaPath, oldValue, newValue) {
      this.get('onBlockMetaReplacedLocally')(
        block, metaPath, oldValue, newValue);
    },

    /**
     * Called when the user replaced a block.
     *
     * TODO: With some fenagling, this can be replaced entirely by the
     * TypeChanges module.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   replaced
     * @param {CanvasEditor.CanvasRealtime.Block} newBlock The block that the
     *   user replaced with
     * @param {object} [opts={}] Options object
     * @param {boolean} opts.focus Whether to focus the replacing block
     */
    blockReplacedLocally(block, newBlock, opts = {}) {
      const idx = this.get('blocks').indexOf(block);
      this.get('blocks').replace(idx, 1, [newBlock]);
      this.get('onBlockReplacedLocally')(idx, block, newBlock);
      if (opts.focus) {
        run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
      }
    },

    /**
     * Called when a block's type was changed in the editor.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The updated block
     */
    blockTypeUpdatedLocally(block) {
      this.get('onBlockTypeUpdatedLocally')(block);
    },

    /**
     * Called when a card unfurls—we increment the `cardLoadIndex` to allow
     * filtering of their content.
     *
     * @method
     */
    cardDidLoad() {
      run.scheduleOnce(
        'afterRender', this, 'incrementProperty', 'cardLoadIndex');
    },

    /**
     * Called when a block's type is changed.
     *
     * This calls the `change:BEFORE/AFTER` methods defined on the typeChange
     * mixin.
     *
     * @method
     * @param {string} typeChange A string representing the "before/after" types
     *   of the block
     * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
     * @param {string} content The content for the block after the change (this
     *   is important for when we need to strip Markdown prefixes like "- [ ]")
     */
    changeBlockType(typeChange, block, content) {
      if (Ember.typeOf(this[`change:${typeChange}`]) === 'function') {
        this[`change:${typeChange}`](block, content);
      } else {
        throw new Error(`Cannot do type change: "${typeChange}"`);
      }
    },

    /**
     * Called when a user selects all twice.
     *
     * We first select all text in a block, and now we do a multi-block
     * selection of the entire canvas.
     *
     * @method
     */
    doubleSelectAll() {
      window.getSelection().removeAllRanges();
      this.get('multiBlockSelect').selectAll();
    },

    /**
     * Called when a user selects to the end twice.
     *
     * @method
     */
    doubleSelectToEnd(block) {
      window.getSelection().removeAllRanges();
      this.get('multiBlockSelect').selectBlock(block);
      this.get('multiBlockSelect').selectToEnd();
    },

    /**
     * Called when a user selects to the start twice.
     *
     * @method
     */
    doubleSelectToStart(block) {
      window.getSelection().removeAllRanges();
      this.get('multiBlockSelect').selectBlock(block);
      this.get('multiBlockSelect').selectToStart();
    },

    /**
     * Called when the user wishes to multi-block select down from the given
     * block.
     *
     * @method
     * @param {CanvasEditor.RealtimeCanvas.Block} block The block to select down
     *   from
     */
    multiBlockSelectDown(block) {
      window.getSelection().removeAllRanges();
      this.get('multiBlockSelect').selectBlock(block);
    },

    /**
     * Called when the user wishes to multi-block select up from the given
     * block.
     *
     * @method
     * @param {CanvasEditor.RealtimeCanvas.Block} block The block to select up
     *   from
     */
    multiBlockSelectUp(block) {
      window.getSelection().removeAllRanges();
      this.get('multiBlockSelect').selectBlock(block);
    },

    /**
     * Called when the user wishes to navigate down to the next block from the
     * currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate down *from*
     * @param {ClientRect} rangeRect The client rect for the current user range
     */
    navigateDown(block, rangeRect) {
      this.navigateVertical(block, rangeRect, 'Down');
    },

    /**
     * Called when the user wishes to navigate to the end of the block before
     * the currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate *from*
     */
    navigateLeft(block) {
      this.navigateHorizontal(block, 'Left');
    },

    /**
     * Called when the user wishes to navigate to the start of the block after
     * the currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate *from*
     */
    navigateRight(block) {
      this.navigateHorizontal(block, 'Right');
    },

    /**
     * Called when the user wishes to navigate up to the previous block from the
     * currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate up *from*
     * @param {ClientRect} rangeRect The client rect for the current user range
     */
    navigateUp(block, rangeRect) {
      this.navigateVertical(block, rangeRect, 'Up');
    },

    /**
     * Called when a new block was added after `prevBlock` and the canvas model
     * needs to be updated.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} prevBlock The block that the
     *   new block should be inserted after
     * @param {CanvasEditor.CanvasRealtime.Block} newBlock The new block
     */
    newBlockInsertedLocally(prevBlock, newBlock) {
      const parent = prevBlock.get('parent.blocks') || this.get('blocks');
      const idx = parent.indexOf(prevBlock) + 1;
      parent.replace(idx, 0, [newBlock]);
      this.get('onNewBlockInsertedLocally')(idx, newBlock);
      run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
    },

    /**
     * Called when the user wishes to "redo" the last operation.
     *
     * @method redo
     * @param {jQuery.Event} evt The `redo` event
     */
    redo(evt) {
      if (this.get('editingEnabled')) this.get('onRedo')(evt);
    },

    /**
     * Swap the block and its previous sibling.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block to swap
     */
    swapBlockUp(block) {
      let blocks;
      if (block.get('parent') && block.get('parent.blocks.0') === block) {
        return;
      } else if (block.get('parent.isGroup')) {
        blocks = this.getNavigableBlocks();
      } else {
        blocks = this.get('canvas.blocks');
      }

      const index = blocks.indexOf(block);
      const neighbour = blocks[index - 1];
      if (neighbour && index !== 1) {
        this.removeBlock(neighbour);
        this.insertBlockAfter(neighbour, block);
      }
    },

    /**
     * Swap the block and its next sibling.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block to swap
     */
    swapBlockDown(block) {
      let blocks;
      if (block.get('parent.isGroup') &&
          block.get('parent.blocks.lastObject') === block) {
        return;
      } else if (block.get('parent.isGroup')) {
        blocks = this.getNavigableBlocks();
      } else {
        blocks = this.get('canvas.blocks');
      }

      const index = blocks.indexOf(block);
      const neighbour = blocks[index + 1];
      let selectionState;

      if (!block.get('isCard')) {
        selectionState =
          new SelectionState(
            this.$(this.getElementForBlock(block)).find(SELECT_EDITABLE)[0]);
        selectionState.capture();
      }

      if (neighbour) {
        this.removeBlock(block);
        this.insertBlockAfter(block, neighbour);
      }

      if (!block.get('isCard')) {
        run.scheduleOnce('afterRender', () => {
          const elem =
            this.$(this.getElementForBlock(block)).find(SELECT_EDITABLE)[0];
          selectionState.element = elem;
          selectionState.restore();
        });
      }
    },

    /**
     * Called when a template should be applied to the canvas.
     *
     * @method
     * @param {CanvasEditor.RealtimeCanvas} template A template to apply to the
     *   canvas
     */
    templateApply(template) {
      const titleBlock = this.get('titleBlock');
      this.updateBlockContent(titleBlock, template.blocks[0].content);
      this.get('onBlockContentUpdatedLocally')(titleBlock);

      template.blocks.slice(1).forEach((blockJSON, idx) => {
        const newBlock = RealtimeCanvas.createBlockFromJSON(blockJSON);
        const existingBlock = this.get('canvas.blocks').objectAt(idx + 1);

        if (existingBlock) {
          this.send('blockReplacedLocally', existingBlock, newBlock);
        } else {
          this.get('canvas.blocks').pushObject(newBlock);
          this.get('onNewBlockInsertedLocally')(idx + 1, newBlock);
        }
      });

      this.get('onTemplateApplied')(template.id);
    },

    /**
     * Called when the user wishes to "undo" the last operation.
     *
     * @method
     * @param {jQuery.Event} evt The `undo` event
     */
    undo(evt) {
      if (this.get('editingEnabled')) this.get('onUndo')(evt);
    },

    /**
     * Called when a card block is rendered to unfurl it.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block to unfurl
     * @returns {Promise<object>} A promise resolving when the unfurl is
     *   complete
     */
    unfurl(block) {
      return this.get('unfurlBlock')(block);
    }
  },

  /*
   * CALLBACK PLACEHOLDERS
   * =====================
   */

  /**
   * A dummy handler for fetching template asynchronously.
   *
   * @method
   * @returns {Promise<Array<CanvasEditor.RealtimeCanvas>>}
   */
  fetchTemplates() { return RSVP.resolve(testTemplates); },

  /**
   * A dummy handler for fetching the upload signature.
   *
   * @method
   * @returns {Promise<object>}
   */
  fetchUploadSignature() { return RSVP.resolve(null); },

  /**
   * A dummy handler for an action that receives a block after it was udpated
   * locally.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The updated block
   */
  onBlockContentUpdatedLocally: Ember.K,

  /**
   * A dummy handler for an action that receives a block, meta path, old value,
   * and new value when the value was replaced.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block whose meta
   *   was updated locally
   * @param {Array<*>} metaPath The path to the updated meta property
   * @param {*} oldValue The old meta value
   * @param {*} newValue The new meta value
   */
  onBlockMetaReplacedLocally: Ember.K,

  /**
   * A dummy handler for an action that receives an index in the block's parent
   * and a block after the block was deleted locally.
   *
   * @method
   * @param {number} index The index the block was deleted from in its parent
   * @param {CanvasEditor.RealtimeCanvas.Block} block The deleted block
   */
  onBlockDeletedLocally: Ember.K,

  /**
   * A dummy handler for a user meta+shift+clicking on text.
   *
   * @method
   * @param {jQuery.Event} evt The `click` event
   */
  onMetaSelectText: Ember.K,

  /**
   * A dummy handler for an action that receives an index and a block after the
   * block was inserted locally.
   *
   * @method
   * @param {number} index The index the new block was inserted at in its parent
   * @param {CanvasEditor.RealtimeCanvas.Block} newBlock The new block
   */
  onNewBlockInsertedLocally: Ember.K,

  /**
   * A dummy handler for an action that receives a replaced block and a block
   * to replace it.
   *
   * @method
   * @param {number} index The index of the replaced block
   * @param {CanvasEditor.RealtimeCanvas.Block} block The replaced block
   * @param {CanvasEditor.RealtimeCanvas.Block} newBlock The replacing block
   */
  onBlockReplacedLocally: Ember.K,

  /**
   * A dummy handler for an action called when the user wants to "redo" the last
   * op.
   *
   * @method
   * @param {jQuery.Event} evt The `redo` event
   */
  onRedo: Ember.K,

  /**
   * A dummy handler for an action called when a template is applied.
   *
   * @method
   * @param {string} templateID The ID of the applied template
   */
  onTemplateApplied: Ember.K,

  /**
   * A dummy handler for an action called when the user wants to "undo" the last
   * op.
   *
   * @method
   * @param {jQuery.Event} evt The `undo` event
   */
  onUndo: Ember.K,

  /**
   * A dummy handler for a function that is passed in in order to unfurl a
   * block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to unfurl
   */
  unfurlBlock() { return RSVP.resolve({}); }
});
