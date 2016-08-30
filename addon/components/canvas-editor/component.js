import Ember from 'ember';
import layout from './template';
import Rangy from 'rangy';
import Selection from 'canvas-editor/lib/selection';

const { run } = Ember;

/**
 * A component that allows for the editing of a canvas in realtime.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  classNames: ['canvas-editor'],
  layout,

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
      const blockIndex = this.get('canvas.blocks').indexOf(block);
      const prevBlock = this.get('canvas.blocks').objectAt(blockIndex - 1);
      if (!prevBlock) return; // `block` is the first block
      this.get('canvas.blocks').removeObject(block);
      prevBlock.get('content').pushObject(remainingContent);
      this.get('onBlockDeletedLocally')(blockIndex, block);
      this.get('onBlockContentUpdatedLocally')(prevBlock);
      run.scheduleOnce('afterRender', this, 'focusBlockEnd', prevBlock);
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
      const blockIndex = this.get('canvas.blocks').indexOf(block);
      const nextBlock = this.get('canvas.blocks').objectAt(blockIndex + 1);
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
      const blockIndex = this.get('canvas.blocks').indexOf(block);
      const prevBlock = this.get('canvas.blocks').objectAt(blockIndex - 1);
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
      const blockIndex = this.get('canvas.blocks').indexOf(block);
      const nextBlock = this.get('canvas.blocks').objectAt(blockIndex + 1);
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
      const blockIndex = this.get('canvas.blocks').indexOf(block);
      const prevBlock = this.get('canvas.blocks').objectAt(blockIndex - 1);
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
      const index = this.get('canvas.blocks').indexOf(prevBlock) + 1;
      this.get('canvas.blocks').replace(index, 0, [newBlock]);
      this.get('onNewBlockInsertedLocally')(index, newBlock);
      run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
    }
  }
});
