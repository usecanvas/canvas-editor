import Ember from 'ember';

/**
 * A generic component to be extended for representing canvas blocks.
 *
 * @class CanvasEditor.CanvasBlockComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  classNames: ['canvas-block'],

  /**
   * A dummy handler for an action that receives a block after its content has
   * been changed by the user.
   *
   * @method onBlockContentUpdatedLocally
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block that changed
   */
  onBlockContentUpdatedLocally: Ember.K,

  /**
   * Called when the block content is updated by the user.
   *
   * @method
   */
  blockContentUpdatedLocally() {
    this.get('onBlockContentUpdatedLocally')(this.get('block'));
  }
});
