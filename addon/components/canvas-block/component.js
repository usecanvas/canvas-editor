import Ember from 'ember';
import styles from './styles';

/**
 * A generic component to be extended for representing canvas blocks.
 *
 * @class CanvasEditor.CanvasBlockComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  styles,
  classNames: ['canvas-block'],
  localClassNames: 'component',

  /**
   * A dummy handler for an action that receives a block after its content has
   * been changed by the user.
   *
   * @method onBlockContentUpdatedLocally
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block that changed
   */
  onBlockContentUpdatedLocally: Ember.K,

  /**
   * A dummy handler for an action that receives a new block and the one that
   * came before it after the new block was inserted.
   *
   * @method onNewBlockInsertedLocally
   * @param {CanvasEditor.RealtimeCanvas.Block} prevBlock The block that the new
   *   block comes after
   * @param {CanvasEditor.RealtimeCanvas.Block} newBlock The new block
   */
  onNewBlockInsertedLocally: Ember.K,

  /**
   * Called when the block content is updated by the user.
   *
   * @method
   */
  blockContentUpdatedLocally() {
    this.get('onBlockContentUpdatedLocally')(this.get('block'));
  },

  /**
   * Called when a new block was inserted locally after this block by the user.
   *
   * @method
   * @param {Array} content The content for the new block
   */
  newBlockInsertedLocally(content) {
    const newBlock = this.get('nextBlockConstructor').create({ content });
    this.get('onNewBlockInsertedLocally')(this.get('block'), newBlock);
  }
});
