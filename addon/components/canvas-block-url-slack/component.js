import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  count: computed('block.meta.count', function() {
    return this.get('block').getWithDefault('meta.count', 1);
  }),

  layout,
  showSettings: false,
  styles,

  filteredMessages: computed('count', 'unfurled.attachments.[]',
    function() {
      const messages = this.get('unfurled.attachments');
      return messages.slice(0, this.get('count'));
    }),

  actions: {
    onCountChanged(oldValue, newValue) {
      this.set('block.meta.count', newValue);

      this.get('onBlockMetaReplacedLocally')(
        this.get('block'),
        ['count'],
        oldValue,
        newValue);
    },

    toggleShowSettings() {
      this.toggleProperty('showSettings');
    }
  }
});
