import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import List from 'canvas-editor/lib/realtime-canvas/list';
import MultiBlockSelect from 'canvas-editor/lib/multi-block-select';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Selection from 'canvas-editor/lib/selection';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import UnorderedListItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import nsEvent from 'canvas-editor/lib/ns-event';

const { getWithDefault, on, run } = Ember;

/**
 * A component that allows for the editing of a canvas in realtime.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
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

  initMultiSelectManager: on('didInsertElement', function() {
    this.set('multiBlockSelect', MultiBlockSelect.create({
      element: this.get('element'),
      canvas: this.get('canvas')
    }));
  }),

  teardownMultiSelectManager: on('willDestroyElement', function() {
    this.get('multiBlockSelect').teardown();
  }),

  actions: {
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
