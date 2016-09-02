import Ember from 'ember';
import Group from 'canvas-editor/lib/realtime-canvas/group';
import layout from './template';
import Rangy from 'rangy';
import Selection from 'canvas-editor/lib/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import styles from './styles';

const { run } = Ember;

/**
 * A component that allows for the editing of a canvas in realtime.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  localClassNames: ['canvas-editor'],
  layout,
  styles,

  didInsertElement() {
    this.focusBlockStart(this.get('canvas.blocks.firstObject'));
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
   * A dummy handler for an action that receives an index and a block after the
   * block was deleted locally.
   *
   * @method
   * @param {number} index The index the block was deleted from
   * @param {CanvasEditor.RealtimeCanvas.Block} block The deleted block
   */
  onBlockDeletedLocally: Ember.K,

  /**
   * A dummy handler for an action that receives an index and a block after the
   * block was inserted locally.
   *
   * @method
   * @param {number} index The index the new block was inserted at
   * @param {CanvasEditor.RealtimeCanvas.Block} newBlock The new block
   */
  onNewBlockInsertedLocally: Ember.K,

  /**
   * Focus at the end of the element that represents the block with the given
   * ID.
   *
   * @method focusBlockEnd
   * @param {CanvasEditor.CanvasRealtime.Block} block The block to find and
   *   focus the element for
   */
  focusBlockEnd(block) {
    const $block = this.$(`[data-block-id="${block.get('id')}"]`);
    const range = Rangy.createRange();
    range.selectNodeContents($block.get(0));
    range.collapse(false /* collapse to end */);
    Rangy.getSelection().setSingleRange(range);
    $block.focus();
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
    const $block = this.$(`[data-block-id="${block.get('id')}"]`);
    const range = Rangy.createRange();
    range.setStart($block.get(0), 0);
    Rangy.getSelection().setSingleRange(range);
    $block.focus();
  },

  getNavigateBlocks() {
    return [].concat(...this.get('canvas.blocks').map(block =>
      block.get('blocks') || block
    ));
  },

  actions: {
    /**
     * Called when block content was updated locally.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.BLock} block The block whose content
     *   was updated locally
     */
    blockContentUpdatedLocally(block) {
      this.get('onBlockContentUpdatedLocally')(block);
    },

    blockTypeUpdatedLocally(block) {
      this.get('onBlockTypeUpdatedLocally')(block);
    },

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
     */
    blockDeletedLocally(block, remainingContent) {
      const blocks = this.getNavigateBlocks();
      let blockIndex = blocks.indexOf(block);
      const prevBlock = blocks.objectAt(blockIndex - 1);
      const $prevBlock = this.$(`[data-block-id="${prevBlock.get('id')}"]`);
      const selectionState = new SelectionState($prevBlock.get(0));
      if (!prevBlock) return; // `block` is the first block
      this.focusBlockEnd(prevBlock);
      selectionState.capture();
      prevBlock.set('lastContent', prevBlock.get('content'));
      prevBlock.set('content', prevBlock.get('content') + remainingContent);
      block = block.get('parent.blocks.length') === 0 ? block.get('parent') : block;
      if (block.get('parent')) {
        blockIndex = block.get('parent.blocks').indexOf(block);
        block.get('parent.blocks').removeObject(block);
        this.get('onBlockDeletedLocally')(blockIndex, block);
      } else {
        this.get('canvas.blocks').removeObject(block);
        this.get('onBlockDeletedLocally')(blockIndex, block);
      }
      this.get('onBlockContentUpdatedLocally')(prevBlock);
      run.scheduleOnce('afterRender', selectionState, 'restore');
    },

    changeToType(typeChange, block, content) {
      switch (typeChange) {
        case 'paragraph/unordered-list':
          const blocks = this.get('canvas.blocks');
          const idx = blocks.indexOf(block);
          const group = Group.create({
            type: 'group-ul',
            blocks: [block]
          });
          this.get('onBlockDeletedLocally')(idx, block);
          block.setProperties({
            'parent': group,
            'type': 'unordered-list',
            'content': content.slice(2)
          });
          blocks.replace(idx, 1, [group]);
          this.get('onNewBlockInsertedLocally')(idx, group);
          run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
      }
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
      const blocks = this.getNavigateBlocks();
      const blockIndex = blocks.indexOf(block);
      const nextBlock = blocks.objectAt(blockIndex + 1);
      if (!nextBlock) return; // `block` is the last block
      Selection.navigateDownToBlock(this.$(), nextBlock, rangeRect);
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
      const blocks = this.getNavigateBlocks();
      const blockIndex = blocks.indexOf(block);
      const prevBlock = blocks.objectAt(blockIndex - 1);
      if (!prevBlock) return; // `block` is the first block
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', prevBlock);
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
      const blocks = this.getNavigateBlocks();
      const blockIndex = blocks.indexOf(block);
      const nextBlock = blocks.objectAt(blockIndex + 1);
      if (!nextBlock) return; // `block` is the last block
      run.scheduleOnce('afterRender', this, 'focusBlockStart', nextBlock);
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
      const blocks = this.getNavigateBlocks();
      const blockIndex = blocks.indexOf(block);
      const prevBlock = blocks.objectAt(blockIndex - 1);
      if (!prevBlock) return; // `block` is the first block
      Selection.navigateUpToBlock(this.$(), prevBlock, rangeRect);
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
      const parent = prevBlock.get('parent.blocks') || this.get('canvas.blocks');
      const index = parent.indexOf(prevBlock) + 1;
      parent.replace(index, 0, [newBlock]);
      this.get('onNewBlockInsertedLocally')(index, newBlock);
      run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
    }
  }
});
