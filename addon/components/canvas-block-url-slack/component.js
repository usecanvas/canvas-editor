import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A component for displaying a Slack message and its history.
 *
 * @class CanvasEditor.CanvasBlockURLSlackComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  layout,
  styles,

  /**
   * @member {boolean} Whether count settings are displayed
   */
  showSettings: false,

  /**
   * @member {number} The maximum number of history messages to display
   */
  count: computed('block.meta.count', function() {
    return this.get('block').getWithDefault('meta.count', 1);
  }),

  /**
   * @param {Array<Object>} The messages to display based on the `count`
   */
  filteredMessages: computed('count', 'unfurled.attachments.[]', function() {
    const messages = this.get('unfurled.attachments');
    return messages.slice(0, this.get('count'));
  }),

  actions: {
    /**
     * Called when the count changes in the slider.
     *
     * @method
     * @param {number} oldValue The previous value
     * @param {number} newValue The new value
     */
    onCountChanged(oldValue, newValue) {
      this.set('block.meta.count', newValue);

      this.get('onBlockMetaReplacedLocally')(
        this.get('block'),
        ['count'],
        oldValue,
        newValue);
    },

    /**
     * Called when the user clicks a button to toggle the count slider.
     *
     * @method
     */
    toggleShowSettings() {
      this.toggleProperty('showSettings');
    }
  }
});
