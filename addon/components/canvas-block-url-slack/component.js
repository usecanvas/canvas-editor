import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  count: 1,
  layout,
  showSettings: false,
  styles,

  filteredMessages: computed('count', 'unfurled.attachment.messages.[]',
    function() {
      const messages = this.get('messages');
      return messages.slice(0, this.get('count'));
    }),

  actions: {
    toggleShowSettings() {
      this.toggleProperty('showSettings');
    }
  }
});
