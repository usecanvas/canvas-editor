import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import List from 'canvas-editor/lib/realtime-canvas/list';
import MultiBlockSelect from 'canvas-editor/lib/multi-block-select';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import RSVP from 'rsvp';
import Rangy from 'rangy';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Selection from 'canvas-editor/lib/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import UnorderedListItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import Upload from 'canvas-editor/lib/realtime-canvas/upload';
import filterBlocks from 'canvas-editor/lib/filter-blocks';
import flattenBy from 'canvas-editor/lib/flatten-by';
import layout from './template';
import nsEvent from 'canvas-editor/lib/ns-event';
import styles from './styles';
import testTemplates from 'canvas-editor/lib/templates';
import { caretRangeFromPoint } from 'canvas-editor/lib/range-polyfill';

const { computed, getWithDefault, inject, observer, on, run } = Ember;

/**
 * A component that allows for the editing of a canvas in realtime.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  cardLoadIndex: 0, // Counter to increment when cards load
  classNames: ['canvas-editor'],
  dropBar: inject.service(),
  localClassNames: ['canvas-editor'],
  isMultiBlock: computed.readOnly('multiBlockSelect.isSelecting'),
  layout,
  styles,

  bindMultiBlockVariants: on('didInsertElement', function() {
    const self = this;

    // Bind a document-level event to this component
    function documentBind(evtName) {
      Ember.$(document).on(nsEvent(evtName, self),
        multiBlockWrap(self[`multiBlock${evtName.capitalize()}`].bind(self)));
    }

    // Return a function that executes a function only if `isMultiBlock`
    function multiBlockWrap(func) {
      return function _multiBlockWrapped(evt) {
        if (self.get('isMultiBlock')) return func(evt);
        return null;
      };
    }

    ['copy',
     'cut',
     'keydown',
     'keypress',
     'paste'].forEach(evtName => documentBind(evtName));
  }),

  unbindMultiBlockVariants: on('willDestroyElement', function() {
    ['copy',
     'cut',
     'keydown',
     'keypress',
     'paste'].forEach(evtName => {
       Ember.$(document).off(nsEvent(evtName, this));
     });
  }),

  /* eslint-disable no-console */
  multiBlockKeydown(evt) {
    let focusBlock;

    switch (evt.key || evt.keyCode) {
      case 'Escape':
      case 27:
        focusBlock =
          this.getNavigableBlocks().filterBy('isSelected').objectAt(0);
        this.get('multiBlockSelect').deSelectAll();
        run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
    }
  },

  multiBlockKeypress(evt) {
    const content = evt.char || String.fromCharCode(evt.charCode);

    let focusBlock;

    this.getNavigableBlocks().filterBy('isSelected').forEach(
      (replacedBlock, i) => {
        if (i === 0) {
          if (replacedBlock.get('type') === 'title') {
            replacedBlock.set('oldContent', replacedBlock.get('content'));
            replacedBlock.set('content', content);
            this.send('blockContentUpdatedLocally', replacedBlock);
            focusBlock = replacedBlock;
          } else if (replacedBlock.get('parent')) {
            focusBlock = this.splitGroupAtMember(replacedBlock, content);
          } else {
            const paragraph = Paragraph.create({ content });
            this.send('blockReplacedLocally', replacedBlock, paragraph);
            focusBlock = paragraph;
          }
        } else {
          this.send('blockDeletedLocally',
            replacedBlock, '', { onlySelf: true });
        }
      });

    this.get('multiBlockSelect').deSelectAll();
    run.scheduleOnce('afterRender', this, 'focusBlockEnd', focusBlock);
  },

  multiBlockCut(_evt) {
    console.log('cut');
  },

  multiBlockCopy(_evt) {
    console.log('copy');
  },

  multiBlockPaste(_evt) {
    console.log('paste');
  },
  /* eslint-enable no-console */

  hasContent: computed('canvas.blocks.[]', function() {
    switch (this.get('canvas.blocks.length')) {
      case 0:
        return false;
      case 1:
        return false;
      case 2:
        return this.get('canvas.blocks').objectAt(1).get('content') !== '';
      default:
        return true;
    }
  }),

  onCanvasTemplateChange: observer('canvas.fillTemplate', function() {
    if (!this.get('canvas.fillTemplate')) return;
    this.send('templateApply', this.get('canvas.fillTemplate'));
  }),

  titleBlock: computed.readOnly('canvas.blocks.firstObject'),

  contentBlocks: computed('canvas.blocks.[]', 'filterTerm', 'cardLoadIndex',
                 function() {
    return filterBlocks(this.get('canvas.blocks').slice(1),
                        this.get('filterTerm'));
  }),

  initialFocusBlock: computed('canvas.blocks.[]', function() {
    const id = (window.location.search.match(/block=(\w{22})/) || [])[1];
    const blocks = this.getNavigableBlocks();
    const block = blocks.findBy('id', id);
    return block || blocks.get('firstObject');
  }),

  didInsertElement() {
    this.bindKeyDownEvents();

    run.next(_ => {
      if (!this.get('element')) return;
      if (!this.get('editingEnabled')) return;
      const block = this.get('initialFocusBlock');
      if (block.get('isCard')) {
        Selection.selectCardBlock(this.$(), block);
      } else {
        this.focusBlockStart(block);
      }
    });

    window.onbeforeunload = () => {
      if (this.get('canvas.blocks').filter(block => block.get('file')).length) {
        return true;
      }
      return null;
    };
  },

  willDestroyElement() {
    this.unbindKeyDownEvents();
    window.onbeforeunload = null;
  },

  bindOutsideClick: on('didInsertElement', function() {
    const self = this;

    Ember.$(document).on(nsEvent('click', this), evt => {
      if (!self.get('element').contains(evt.target)) {
        self.$('[data-card-block-selected=true]')
          .attr('data-card-block-selected', false);
      }
    });
  }),

  unbindOutsideClick: on('willDestroyElement', function() {
    Ember.$(document).off(nsEvent('click', this));
  }),

  fetchTemplates() {
    return RSVP.resolve(testTemplates);
  },

  fetchUploadSignature() {
    return RSVP.resolve(null);
  },

  initMultiSelectManager: on('didInsertElement', function() {
    this.set('multiBlockSelect', MultiBlockSelect.create({
      element: this.get('element'),
      canvas: this.get('canvas')
    }));
  }),

  teardownMultiSelectManager: on('willDestroyElement', function() {
    this.get('multiBlockSelect').teardown();
  }),

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
   * A dummy handler for a function that is passed in in order to unfurl a
   * block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to unfurl
   */
  unfurlBlock() { return Ember.RSVP.resolve({}); },

  /**
   * Bind click event for focusing cards.
   *
   * @method
   */
  click(evt) {
    const $target = this.$(evt.target);

    if ($target.closest('.canvas-block-card').get(0) &&
        evt.target.tagName !== 'A') {
      self.$('[data-card-block-selected=true]')
        .attr('data-card-block-selected', false);

      const block = this.get('canvas.blocks')
        .findBy('id',
                $target.closest('.canvas-block-card').attr('data-block-id'));
      Selection.selectCardBlock(this.$(), block);
    } else if (evt.metaKey && evt.shiftKey) {
      this.get('onMetaSelectText')(evt);
    }
  },

  /**
   * Handler for dragenter event
   * @method dragEnter
   */
  dragEnter() {
    this.$('*').css('pointer-events', 'none');
  },

  /**
   * Handler for when a file is dragged over the canvas
   * @method dragFileOver
   * @param {number} clientX The x coordinate of the cursor
   * @param {number} clientY The y coordinate of the cursor
   */
  dragFileOver(clientX, clientY) {
    const range = caretRangeFromPoint(clientX, clientY);
    if (!range) return;
    const block = this.$(range.startContainer).closest('.canvas-block');
    if (!block.length) return;
    const { top, height } = block[0].getBoundingClientRect();
    const shouldInsertAfter = clientY - top > height / 2;
    const id = block.attr('data-block-id');

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
   * Handler for dragleave event
   * @method dragLeave
   * @param {jQuery.Event} evt The dragleave event
   */
  dragLeave() {
    this.$('*').css('pointer-events', 'auto');
    this.set('dropBar.insertAfter', null);
  },

  /**
   * Handler for dragover event
   * @method dragOver
   * @param {jQuery.Event} evt The dragover event
   */
  dragOver(evt) {
    const { clientX, clientY, dataTransfer: { types } } = evt;
    if (!Array.from(types).includes('Files')) return;
    evt.preventDefault();
    this.dragFileOver(clientX, clientY);
  },

  /**
   * Handler for drop event
   * @method drop
   * @param {jQuery.Event} evt The drop event
   */
  drop(evt) {
    const { dataTransfer: { files } } = evt;
    if (!files[0]) return;
    this.dropFile(evt, files[0]);
  },

  /**
   * Handler for when a file is dropped into the canvas
   * @method dropFile
   * @param {jQuery.Event} evt The drop event
   * @param {File} file The file that was dropped
   */
  dropFile(evt, file) {
    evt.preventDefault();
    const flatBlocks = this.getNavigableBlocks();
    const insertId = this.get('dropBar.insertAfter');
    const block = flatBlocks.findBy('id', insertId);
    const uploadBlock =
      Upload.create({ file, meta: { filename: file.name, progress: 0 } });

    this.set('dropBar.insertAfter', null);

    if (!block) return;
    this.insertUploadAfterBlock(block, uploadBlock);
  },

  mouseDown(evt) {
    if (evt.metaKey && evt.shiftKey) {
      evt.preventDefault();
    }
  },

  onMetaSelectText: Ember.K,

  isInEditor(evt) {
    return Ember.$.contains(this.$()[0], evt.target) ||
      this.$('[data-card-block-selected=true]').length;
  },

  /**
   * Bind keyDown events on `document`, because they do not fire on the editor
   * when a card block is selected.
   *
   * @method
   */
  bindKeyDownEvents() {
    const self = this; // eslint-disable-line consistent-this

    Ember.$(document).on(nsEvent('focus', this),
                         '.canvas-block-editable', function() {
      self.$('[data-card-block-selected=true]')
        .attr('data-card-block-selected', false);
    });

    Ember.$(document).on(nsEvent('keydown', this), function(evt) {
      if (!self.get('editingEnabled')) return;

      const selectedCardElement =
        self.$('[data-card-block-selected=true]').get(0);

      if (evt.originalEvent.keyCode === 27 && self.isInEditor(evt)) {
        if (selectedCardElement) {
          selectedCardElement.setAttribute('data-card-block-selected', false);
        } else {
          evt.target.blur();
        }
        return;
      }

      if (!selectedCardElement) return;

      const blocks = self.get('canvas.blocks');
      const block = blocks
        .findBy('id', selectedCardElement.getAttribute('data-block-id'));

      switch (evt.originalEvent.key || evt.originalEvent.keyCode) {
      case 'ArrowLeft':
      case 37:
      case 'ArrowUp':
      case 38:
        evt.preventDefault();
        selectedCardElement.setAttribute('data-card-block-selected', false);
        self.send('navigateUp', block);
        break;
      case 'ArrowRight':
      case 39:
      case 'ArrowDown':
      case 40:
        evt.preventDefault();
        // check if next block exists
        if (!blocks.objectAt(blocks.indexOf(block) + 1)) return;
        selectedCardElement.setAttribute('data-card-block-selected', false);
        self.send('navigateDown', block);
        break;
      case 'Backspace':
      case 8:
        evt.preventDefault();
        selectedCardElement.setAttribute('data-card-block-selected', false);
        self.send('navigateUp', block);
        self.send('blockDeletedLocally', block, null, { onlySelf: true });
        break;
      case 'Enter':
      case 13:
        evt.preventDefault();
        self.send('newBlockInsertedLocally', block, Paragraph.create());
        break;
      }
    });
  },

  /**
   * Unbind keyDown events on `document`.
   *
   * @method
   */
  unbindKeyDownEvents() {
    Ember.$(document).off(`.${Ember.guidFor(this)}`);
  },

  /**
   * Focus at the end of the element that represents the block with the given
   * ID.
   *
   * @method focusBlockEnd
   * @param {CanvasEditor.CanvasRealtime.Block} block The block to find and
   *   focus the element for
   */
  focusBlockEnd(block) {
    let $block = this.$(`[data-block-id="${block.get('id')}"]`);
    const $editableContent = $block.find('.canvas-block-editable');
    if ($editableContent.length) $block = $editableContent;
    const blockElement = $block.get(0);
    const range = Rangy.createRange();

    // Empty blocks have a <br> and focusing after it does not work.
    if (block.get('content') === '') {
      range.setStart(blockElement, 0);
    } else {
      range.setStart(blockElement, blockElement.childNodes.length);
    }

    Rangy.getSelection().setSingleRange(range);
    $block.focus();
    Selection.scrollTo(blockElement);
  },

  /**
   * Focus at the beginning of the element that represents the block with the
   * given ID.
   *
   * @method focusBlockStart
   * @param {CanvasEditor.CanvasRealtime.Block} block The block to find and
   *   focus the element for
   */
  focusBlockStart(block) {
    let $block = this.$(`[data-block-id="${block.get('id')}"]`);
    const $editableContent = $block.find('.canvas-block-editable');
    if ($editableContent.length) $block = $editableContent;
    const blockElement = $block.get(0);
    const range = Rangy.createRange();
    range.setStart(blockElement, 0);
    Rangy.getSelection().setSingleRange(range);
    $block.focus();
    Selection.scrollTo(blockElement);
  },

  /**
   * Return the list of navigable blocks, which excludes groups.
   *
   * @method
   * @returns {Array<CanvasEditor.CanvasRealtime.Block}
   */
  getNavigableBlocks() {
    return flattenBy(this.get('canvas.blocks'), 'isGroup', 'blocks');
  },

  /**
   * Remove a group from the canvas if it is empty.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.GroupBlock} group The group that will
   *   be removed if empty
   */
  removeGroupIfEmpty(group) {
    if (group.get('blocks.length') > 0) return;
    const index = this.get('canvas.blocks').indexOf(group);
    this.get('canvas.blocks').removeObject(group);
    this.get('onBlockDeletedLocally')(index, group);
  },

  /**
   * Insert the upload block into the canvas after the given block
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block that will be
   *  before the inserted block
   * @param {CanvasEditor.CanvasRealtime.Block} uploadBlock The block that will
   *   be inserted
   */
  insertUploadAfterBlock(block, uploadBlock) {
    if (block.get('parent') &&
        block.get('parent.blocks.lastObject') !== block) {
      this.splitGroupAtBlock(block, uploadBlock, false);
      return;
    }
    const index = this.get('canvas.blocks')
      .indexOf(block.get('parent') || block);
    this.get('canvas.blocks').replace(index + 1, 0, [uploadBlock]);
    this.get('onNewBlockInsertedLocally')(index + 1, uploadBlock);
  },

  /**
   * Split a block's group at the block, either replacing or inserting after the
   * block.
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
    const index = group.get('blocks').indexOf(block);
    const groupIndex = this.get('canvas.blocks').indexOf(group);
    const movedGroupBlocks = Ember.A(group.get('blocks').slice(index + 1));

    movedGroupBlocks.forEach(movedGroupBlock => {
      this.get('onBlockDeletedLocally')(index + 1, movedGroupBlock);
    });

    const newGroup = group.constructor.create({ blocks: movedGroupBlocks });
    group.get('blocks').replace(index + 1, Infinity, []);

    if (shouldReplace) {
      group.get('blocks').replace(index, Infinity, []);
      this.get('onBlockDeletedLocally')(index, block);
    }

    this.get('canvas.blocks').replace(groupIndex + 1, 0, [insertBlock]);
    this.get('onNewBlockInsertedLocally')(groupIndex + 1, insertBlock);

    if (newGroup.get('blocks.length')) {
      this.get('canvas.blocks').replace(groupIndex + 2, 0, [newGroup]);
      this.get('onNewBlockInsertedLocally')(groupIndex + 2, newGroup);
    }

    this.removeGroupIfEmpty(group);
  },

  /**
   * Split a block's group at the block, replacing it with a paragraph.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block whose group will
   *   be split
   * @param {string} content The content for the new block created for the split
   * @returns {CanvasEditor.CanvasRealtime.Block} The new paragraph
   */
  splitGroupAtMember(block, content) {
    const paragraph = Paragraph.create({ id: block.get('id'), content });
    this.splitGroupAtBlock(block, paragraph, true);
    run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
    return paragraph;
  },

  actions: {
    /**
     * Called when block content was updated locally.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block whose content
     *   was updated locally
     */
    blockContentUpdatedLocally(block) {
      this.get('onBlockContentUpdatedLocally')(block);
    },

    /**
     * Called when block meta was updated locally.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block whose meta
     *   was updated locally
     * @param {Array<*>} metaPath The path to the updated meta property
     * @param {*} oldValue The old meta value
     * @param {*} newValue The new meta value
     */
    blockMetaReplacedLocally(block, metaPath, oldValue, newValue) {
      this.get('onBlockMetaReplacedLocally')(
        block, metaPath, oldValue, newValue);
    },

    /**
     * Called when block type was updated locally.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block whose type was
     *   updated locally
     */
    blockTypeUpdatedLocally(block) {
      this.get('onBlockTypeUpdatedLocally')(block);
    },

    /* eslint-disable max-statements */
    /**
     * Called when the user deletes a block.
     *
     * If there is still text remaining, we join it with the previous block,
     * if possible.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   deleted in
     * @param {string} remainingContent The remaining content left in the block
     * @param {object} opts Options for deleting the block
     * @param {boolean} opts.onlySelf Only remove the given block
     */
    blockDeletedLocally(block, remainingContent = '', opts = {}) {
      if (opts.onlySelf) {
        if (block.get('parent')) {
          const index = block.get('parent.blocks').indexOf(block);
          block.get('parent.blocks').removeObject(block);
          this.get('onBlockDeletedLocally')(index, block);
          this.removeGroupIfEmpty(block.get('parent'));
        } else {
          const index = this.get('canvas.blocks').indexOf(block);
          this.get('canvas.blocks').removeObject(block);
          this.get('onBlockDeletedLocally')(index, block);
        }
        return;
      }

      const navigableBlocks = this.getNavigableBlocks();
      const navigableIndex = navigableBlocks.indexOf(block);
      const prevBlock = navigableBlocks.objectAt(navigableIndex - 1);

      if (!prevBlock) return; // `block` is the first block

      if (prevBlock.get('isCard')) {
        if (!block.get('content')) {
          this.send('blockDeletedLocally', block, '', { onlySelf: true });
        }

        Selection.selectCardBlock(this.$(), prevBlock);
        return;
      }

      /*
       * Capture selection at the end of the previous block, so we can restore
       * to that position once we've joined the deleted block's remaining
       * content onto it.
       */
      const $prevBlock = this.$(`[data-block-id="${prevBlock.get('id')}"]`);
      const selectionState =
        new SelectionState($prevBlock.find('.canvas-block-editable').get(0));
      this.focusBlockEnd(prevBlock);
      selectionState.capture();

      prevBlock.set('lastContent', prevBlock.get('content'));
      prevBlock.set('content', prevBlock.get('content') + remainingContent);

      // It's not clear why we do this (cc @olivia)
      if (block.get('parent.blocks.length') === 0) {
        block = block.get('parent');
      }

      if (block.get('parent')) {
        const index = block.get('parent.blocks').indexOf(block);
        block.get('parent.blocks').removeObject(block);
        this.get('onBlockDeletedLocally')(index, block);
        this.removeGroupIfEmpty(block.get('parent'));
      } else {
        const index = this.get('canvas.blocks').indexOf(block);
        this.get('canvas.blocks').removeObject(block);
        this.get('onBlockDeletedLocally')(index, block);
      }

      this.get('onBlockContentUpdatedLocally')(prevBlock);
      run.scheduleOnce('afterRender', selectionState, 'restore');
    },
    /* eslint-enable max-statements */

    /* eslint-disable max-statements */
    changeBlockType(typeChange, block, content) {
      const blocks = this.get('canvas.blocks');

      switch (typeChange) {
        case 'upload/image': {
          const index = this.get('canvas.blocks').indexOf(block);

          const newBlock =
            Image.create({ meta: { url: block.get('meta.url') } });
          this.get('onBlockDeletedLocally')(index, block);
          this.get('onNewBlockInsertedLocally')(index, newBlock);
          this.get('canvas.blocks').replace(index, 1, [newBlock]);
          run.scheduleOnce('afterRender', _ => {
            this.$('[data-card-block-selected=true]')
              .attr('data-card-block-selected', false);
            Selection.selectCardBlock(this.$(), newBlock);
          });
          break;
        }
        case 'upload/url-card': {
          const index = this.get('canvas.blocks').indexOf(block);
          const newBlock =
            URLCard.create({ meta: { url: block.get('meta.url') } });
          this.get('onBlockDeletedLocally')(index, block);
          this.get('onNewBlockInsertedLocally')(index, newBlock);
          this.get('canvas.blocks').replace(index, 1, [newBlock]);
          run.scheduleOnce('afterRender', _ => {
            this.$('[data-card-block-selected=true]')
              .attr('data-card-block-selected', false);
            Selection.selectCardBlock(this.$(), newBlock);
          });
          break;
        }
        case 'paragraph/unordered-list-item': {
          const index = blocks.indexOf(block);

          this.get('onBlockDeletedLocally')(index, block);

          const group = List.create({ blocks: Ember.A([block]) });

          block.setProperties({
            type: 'unordered-list-item',
            content: content.slice(2),
            meta: { level: 1 }
          });

          blocks.replace(index, 1, [group]);
          this.get('onNewBlockInsertedLocally')(index, group);
          run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
          break;
        } case 'paragraph/heading': {
          const index = this.get('canvas.blocks').indexOf(block);
          const newBlock =
            Heading.createFromMarkdown(content, { id: block.get('id') });
          this.get('onBlockDeletedLocally')(index, block);
          this.get('onNewBlockInsertedLocally')(index, newBlock);
          this.get('canvas.blocks').replace(index, 1, [newBlock]);
          run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
          break;
        } case 'checklist-item/paragraph':
          case 'unordered-list-item/paragraph': {
          this.splitGroupAtMember(block, content);
          break;
        } case 'checklist-item/unordered-list-item': {
          const group = block.get('parent');
          const index = group.get('blocks').indexOf(block);
          const newBlock =
            UnorderedListItem.createFromMarkdown(content, {
              id: block.get('id'),
              meta: { level: block.getWithDefault('meta.level', 1) },
              parent: group
            });
          this.get('onBlockDeletedLocally')(index, block);
          this.get('onNewBlockInsertedLocally')(index, newBlock);
          group.get('blocks').replace(index, 1, [newBlock]);
          run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
          break;
        } case 'unordered-list-item/checklist-item': {
          const group = block.get('parent');
          const index = group.get('blocks').indexOf(block);
          const newBlock =
            ChecklistItem.createFromMarkdown(content, {
              id: block.get('id'),
              meta: { level: block.getWithDefault('meta.level', 1) },
              parent: group
            });
          this.get('onBlockDeletedLocally')(index, block);
          this.get('onNewBlockInsertedLocally')(index, newBlock);
          group.get('blocks').replace(index, 1, [newBlock]);
          run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
          break;
        } default: {
          throw new Error(`Cannot do type change: "${typeChange}"`);
        }
      }
    },
    /* eslint-enable max-statements */

    /**
     * Called when the user replaces a block, such as converting a paragraph
     * to a URL card.
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
      const index = this.get('canvas.blocks').indexOf(block);
      this.get('canvas.blocks').replace(index, 1, [newBlock]);
      this.get('onBlockReplacedLocally')(index, block, newBlock);
      if (opts.focus) {
        run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
      }
    },

    /**
     * Called when a card unfurls, allowing us to increment a property and react
     * to that event.
     *
     * @method
     */
    cardDidLoad() {
      run.scheduleOnce(
        'afterRender', this, 'incrementProperty', 'cardLoadIndex');
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
      const blocks = this.getNavigableBlocks();
      const blockIndex = blocks.indexOf(block);
      const nextBlock = blocks.objectAt(blockIndex + 1);
      if (!nextBlock) return; // `block` is the last block

      if (nextBlock.get('isCard')) {
        Selection.selectCardBlock(this.$(), nextBlock);
      } else if (block.get('isCard')) {
        run.scheduleOnce('afterRender', this, 'focusBlockStart', nextBlock);
      } else {
        Selection.navigateDownToBlock(this.$(), nextBlock, rangeRect);
      }
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
      const blocks = this.getNavigableBlocks();
      const blockIndex = blocks.indexOf(block);
      const prevBlock = blocks.objectAt(blockIndex - 1);
      if (!prevBlock) return; // `block` is the first block

      if (prevBlock.get('isCard')) {
        Selection.selectCardBlock(this.$(), prevBlock);
      } else {
        run.scheduleOnce('afterRender', this, 'focusBlockEnd', prevBlock);
      }
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
      const blocks = this.getNavigableBlocks();
      const blockIndex = blocks.indexOf(block);
      const nextBlock = blocks.objectAt(blockIndex + 1);
      if (!nextBlock) return; // `block` is the last block

      if (nextBlock.get('isCard')) {
        Selection.selectCardBlock(this.$(), nextBlock);
      } else {
        run.scheduleOnce('afterRender', this, 'focusBlockStart', nextBlock);
      }
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
      const blocks = this.getNavigableBlocks();
      const blockIndex = blocks.indexOf(block);
      const prevBlock = blocks.objectAt(blockIndex - 1);
      if (!prevBlock) return; // `block` is the first block

      if (prevBlock.get('isCard')) {
        Selection.selectCardBlock(this.$(), prevBlock);
      } else if (block.get('isCard')) {
        run.scheduleOnce('afterRender', this, 'focusBlockEnd', prevBlock);
      } else {
        Selection.navigateUpToBlock(this.$(), prevBlock, rangeRect);
      }
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
      const parent =
        prevBlock.get('parent.blocks') || this.get('canvas.blocks');
      const index = parent.indexOf(prevBlock) + 1;
      parent.replace(index, 0, [newBlock]);
      this.get('onNewBlockInsertedLocally')(index, newBlock);
      run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
    },

    /**
     * Called when a template should be applied to the canvas.
     *
     * @method
     * @param {Array<object>} template A template to apply to the canvas.
     */
    templateApply(template) {
      const titleBlock = this.get('canvas.blocks').objectAt(0);
      titleBlock.set('lastContent', titleBlock.get('content'));
      titleBlock.set('content', template.blocks[0].content);
      this.get('onBlockContentUpdatedLocally')(titleBlock);

      const paragraphBlock = this.get('canvas.blocks').objectAt(1);
      if (paragraphBlock) {
        paragraphBlock.set('lastContent', paragraphBlock.get('content'));
        paragraphBlock.set('content',
                           getWithDefault(template, 'blocks.1.content', ''));
        this.get('onBlockContentUpdatedLocally')(paragraphBlock);
      }


      const contentBlocks =
          template.blocks
            .slice(paragraphBlock ? 2 : 1)
            .map(RealtimeCanvas.createBlockFromJSON.bind(RealtimeCanvas));

      const contentBlocksLength = contentBlocks.length;

      for (let i = 0; i < contentBlocksLength; i += 1) {
        const newBlock = contentBlocks[i];
        this.get('canvas.blocks').pushObject(newBlock);
        this.get('onNewBlockInsertedLocally')(i + 1, newBlock);
      }
    },

    /**
     * Called when a card block is rendered to unfurl it.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block to unfurl
     */
    unfurl(block) {
      return this.get('unfurlBlock')(block);
    }
  }
});
