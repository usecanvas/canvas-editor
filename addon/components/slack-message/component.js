import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  layout,
  localClassNames: ['slack-message'],
  styles,

  unixTimestamp: computed('message.timestamp', function() {
    return parseFloat(this.get('message.timestamp')) * 1000;
  })
});
