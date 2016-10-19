import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import DS from 'ember-data';
import Ember from 'ember';
import RSVP from 'rsvp';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a card.
 *
 * @class CanvasEditor.CanvasBlockCardComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-card'],
  layout,
  localClassNames: ['canvas-block-card'],
  styles,

  authComponent: computed('unfurled.providerName', function() {
    switch (this.get('unfurled.providerName')) {
      case 'GitHub':
        return this.get('githubAuthComponent');
      default:
        return null;
    }
  }),

  showAuthComponent: computed('unfurled.providerName',
                              'unfurled.fetched', function() {
    return !this.get('unfurled.fetched') &&
      this.get('unfurled.providerName') === 'GitHub';
  }),

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

  unfurled: computed('block', function() {
    return DS.PromiseObject.create({
      promise: new RSVP.Promise((resolve, reject) => {
        this.get('unfurl')(this.get('block')).then(unfurled => {
          this.get('block').set('unfurled', unfurled);
          resolve(unfurled);
        }).catch(reject);
      })
    });
  })
});
