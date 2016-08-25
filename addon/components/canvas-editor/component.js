import Ember from 'ember';
import layout from './template';

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
   * A dummy handler for an action that receives an index and a block after the
   * block was inserted locally.
   *
   * @method onNewBlockInsertedLocally
   * @param {number} index The index the new block was inserted at
   * @param {CanvasEditor.RealtimeCanvas.Block} newBlock The new block
   */
  onNewBlockInsertedLocally: Ember.K,

  actions: {
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
    }
  }
});
