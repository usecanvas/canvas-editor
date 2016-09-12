import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { on } = Ember;

/**
 * A component representing a card.
 *
 * @class CanvasEditor.CanvasBlockCardComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-card'],
  layout,
  localClassNames: ['component'],
  styles,

  /**
   * Called in order to "unfurl" the card to get properties set on the
   * component.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The block to unfurl
   * @returns {object} An object representing properties unfurled from the block
   */
  unfurl() {
    return Ember.RSVP.resolve({});
  },

  doUnfurl: on('didInsertElement', function() {
    this.get('unfurl')(this.get('block')).then(props => {
      if (this.get('isVisible')) this.setProperties(props);
    });
  })
});
