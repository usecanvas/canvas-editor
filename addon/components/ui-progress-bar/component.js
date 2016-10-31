import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed, String } = Ember;

export default Ember.Component.extend({
  layout,
  localClassNames: ['ui-progress-bar'],
  styles,

  htmlSafeProgress: computed('progress', function() {
    return String.htmlSafe(this.get('progress'));
  })
});
