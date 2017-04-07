import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import DS from 'ember-data';
import Ember from 'ember';
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

  cardDidLoad() {},

  authComponent: computed('unfurled.providerName', function() {
    switch (this.get('unfurled.providerName')) {
      case 'GitHub':
        return this.get('githubAuthComponent');
      case 'Slack':
        return this.get('slackAuthComponent');
      default:
        return null;
    }
  }),

  showAuthComponent: computed('unfurled.providerName',
                              'unfurled.fetched', function() {
    return !this.get('unfurled.fetched') &&
      ['GitHub', 'Slack'].includes(this.get('unfurled.providerName'));
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
    const block = this.get('block');
    const promise =  DS.PromiseObject.create({
      promise: this.get('unfurl')(block).then(unfurled => {
        this.get('cardDidLoad')();
        block.set('unfurled', unfurled);
        return unfurled;
      })
    });
    // Catch error thrown by the PromiseProxy to not trigger error notification
    promise.catch(function() {});
    return promise;
  })
});
