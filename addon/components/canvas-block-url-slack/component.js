import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  count: 1,
  layout,
  styles,

  messages: computed('unfurled.text', function() {
    const text = this.get('unfurled.text');

    return Ember.A([
      text,
      'Another message',
      'Show me more',
      'Hello world',
      'This is quite good'
    ]);
  }),

  filteredMessages: computed('count', 'messages', function() {
    const text = this.get('messages');
    return text.slice(0, this.get('count'));
  })
});
