import Ember from 'ember';
import layout from './template';
import styles from './styles';

export default Ember.Component.extend({
  layout,
  localClassNames: ['slack-message'],
  styles
});
