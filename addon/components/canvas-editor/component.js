import Base62UUID from 'canvas-editor/lib/base62-uuid';
import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import FileUpload from 'canvas-editor/lib/file-upload';
import filterBlocks from 'canvas-editor/lib/filter-blocks';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import layout from './template';
import List from 'canvas-editor/lib/realtime-canvas/list';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import Rangy from 'rangy';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import RSVP from 'rsvp';
import Selection from 'canvas-editor/lib/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import styles from './styles';
import testTemplates from 'canvas-editor/lib/templates';
import UnorderedListItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import Upload from 'canvas-editor/lib/realtime-canvas/upload';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';

const { computed, inject, observer, run } = Ember;

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
  hasContent: computed.gt('canvas.blocks.length', 1),
  localClassNames: ['canvas-editor'],
  localClassNameBindings: ['dragging'],
  layout,
  styles,

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
    const block = this.get('canvas.blocks').findBy('id', id);
    return block || this.get('canvas.blocks.firstObject');
  }),

  didInsertElement() {
    this.bindKeyDownEvents();

    run.next(_ => {
      if (!this.get('element')) return;
      if (!this.get('editingEnabled')) return;
      this.focusBlockStart(this.get('initialFocusBlock'));
    });
  },

  willDestroyElement() {
    this.unbindKeyDownEvents();
  },

  fetchTemplates() {
    return RSVP.resolve(testTemplates);
  },

  fetchUploadSignature() {
    return RSVP.resolve(null);
  },

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

  dragEnter() {
    this.set('dragging', true);
  },

  dragFileOver(clientX, clientY) {
    const range = this.getCaretRangeFromPoint(clientX, clientY);
    const block = this.$(range.startContainer).closest('.canvas-block');
    if (!block.length) return;
    const { top, height } = block[0].getBoundingClientRect();
    const shouldInsertAfter = clientY - top > height / 2;
    const id = block.attr('data-block-id');

    this.set('dragging', true);

    if (shouldInsertAfter) {
      this.set('dropBar.insertAfter', id);
    } else {
      const blocks = this.getNavigableBlocks();
      const idx = blocks.indexOf(blocks.findBy('id', id));
      const newId = blocks.objectAt(Math.max(0, idx - 1)).get('id');
      this.set('dropBar.insertAfter', newId);
    }
  },

  dragLeave() {
    this.set('dropBar.insertAfter', null);
    this.set('dragging', false);
  },

  dragOver(evt) {
    const { clientX, clientY, dataTransfer: { types } } = evt;
    if (!Array.from(types).includes('Files')) return;
    evt.preventDefault();
    this.dragFileOver(clientX, clientY);
  },

  drop(evt) {
    const { dataTransfer: { files: [file] } } = evt;
    if (!file) return;
    this.dropFile(evt, file);
  },

  dropFile(evt, file) {
    evt.preventDefault();
    const flatBlocks = this.getNavigableBlocks();
    const insertId = this.get('dropBar.insertAfter');
    const block = flatBlocks.findBy('id', insertId);
    const uploadBlock =
      Upload.create({ meta: { filename: file.name, progress: 0 } });

    this.set('dropBar.insertAfter', null);
    this.set('dragging', false);

    if (!block) return;
    this.insertUploadAfterBlock(block, uploadBlock);
    this.uploadFile(file, uploadBlock);
  },

  getCaretRangeFromPoint(x, y) {
    let range;
    if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(x, y);

      if (position) {
        range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
      }
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
    }
    return range;
  },

  generateFileUpload(file, key, uploadSignature) {
    return new FileUpload({
      key,
      'Content-Type': file.type,
      AWSAccessKeyId: uploadSignature.get('id'),
      acl: 'public-read',
      policy: uploadSignature.get('policy'),
      signature: uploadSignature.get('signature'),
      file
    });
  },

  uploadFile(file, block) {
    const key = `uploads/${Base62UUID.generate()}/${file.name}`;

    this.get('fetchUploadSignature')().then(uploadSignature => {
      if (!uploadSignature) return;
      const onprogress = Ember.run.bind(this, this.updateBlockProgress, block);
      const uploadUrl = uploadSignature.get('uploadUrl');
      const fileUrl = `${uploadUrl}/${key}`;
      const upload = this.generateFileUpload(file, key, uploadSignature);

      block.set('meta.url', fileUrl);
      upload.upload(uploadUrl, onprogress).then(_ => {
        if (!this.get('canvas.blocks').includes(block)) return;
        const type = file.type.split('/')[0] === 'image' ? 'image' : 'url-card';
        this.send('changeBlockType', `upload/${type}`, block);
      });
    });
  },

  updateBlockProgress(block, { loaded, total }) {
    if (this.get('canvas.blocks').includes(block)) {
      const oldProgress = block.get('meta.progress');
      const newProgress = Math.round(100 * loaded / total);
      block.set('meta.progress', newProgress);
      this.get('onBlockMetaReplacedLocally')(
        block,
        ['progress'],
        oldProgress,
        newProgress);
    }
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

      const block = self.get('canvas.blocks')
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
    return Ember.A([].concat(...this.get('canvas.blocks').map(block => {
      if (block.get('isGroup')) {
        return block.get('blocks');
      }

      return block;
    })));
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

  insertUploadAfterBlock(block, uploadBlock) {
    if (!block.get('parent') ||
        block.get('parent.blocks.lastObject') === block) {
      const index = this.get('canvas.blocks')
        .indexOf(block.get('parent') || block);
      this.get('canvas.blocks').replace(index + 1, 0, [uploadBlock]);
      this.get('onNewBlockInsertedLocally')(index + 1, uploadBlock);
      return;
    }

    const group = block.get('parent');
    const index = group.get('blocks').indexOf(block);
    const groupIndex = this.get('canvas.blocks').indexOf(group);
    const movedGroupBlocks = Ember.A(group.get('blocks').slice(index + 1));

    movedGroupBlocks.forEach(movedGroupBlock => {
      this.get('onBlockDeletedLocally')(index + 1, movedGroupBlock);
    });

    const newGroup = group.constructor.create({ blocks: movedGroupBlocks });

    group.get('blocks').replace(index + 1, Infinity, []);
    this.get('canvas.blocks').replace(groupIndex + 1, 0, [uploadBlock]);
    this.get('onNewBlockInsertedLocally')(groupIndex + 1, uploadBlock);
    this.get('canvas.blocks').replace(groupIndex + 2, 0, [newGroup]);
    this.get('onNewBlockInsertedLocally')(groupIndex + 2, newGroup);
  },

  /**
   * Split a block's group at the block, replacing it with a paragraph.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block whose group will
   *   be split
   * @param {string} content The content for the new block created for the split
   */
  splitGroupAtMember(block, content) {
    const group = block.get('parent');
    const index = group.get('blocks').indexOf(block);
    const groupIndex = this.get('canvas.blocks').indexOf(group);
    const movedGroupBlocks = Ember.A(group.get('blocks').slice(index + 1));

    movedGroupBlocks.forEach(movedGroupBlock => {
      this.get('onBlockDeletedLocally')(index + 1, movedGroupBlock);
    });

    const newGroup = group.constructor.create({ blocks: movedGroupBlocks });

    group.get('blocks').replace(index, Infinity, []);
    this.get('onBlockDeletedLocally')(index, block);

    const paragraph = Paragraph.create({ id: block.get('id'), content });
    this.get('canvas.blocks').replace(groupIndex + 1, 0, [paragraph]);
    this.get('onNewBlockInsertedLocally')(groupIndex + 1, paragraph);

    if (movedGroupBlocks.get('length')) {
      this.get('canvas.blocks').replace(groupIndex + 2, 0, [newGroup]);
      this.get('onNewBlockInsertedLocally')(groupIndex + 2, newGroup);
    }

    this.removeGroupIfEmpty(group);
    run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
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
        const index = this.get('canvas.blocks').indexOf(block);
        this.get('canvas.blocks').removeObject(block);
        this.get('onBlockDeletedLocally')(index, block);
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
      this.get('canvas.blocks').replace(index, 1, newBlock);
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

      const contentBlocks =
          template.blocks
            .slice(1)
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

function nsEvent(event, object) {
  return `${event}.${Ember.guidFor(object)}`;
}
