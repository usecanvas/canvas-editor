import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  count: 1,
  layout,
  showSettings: false,
  styles,

  filteredMessages: computed('count', 'unfurled.attachments.[]',
    function() {
      const messages = this.get('unfurled.attachments');
      return messages.slice(0, this.get('count'));
    }),

  actions: {
    toggleShowSettings() {
      this.toggleProperty('showSettings');
    }
  }
});
