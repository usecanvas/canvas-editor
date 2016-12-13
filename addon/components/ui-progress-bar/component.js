import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  layout,
  localClassNames: ['ui-progress-bar'],
  styles,

  progressStyles: computed('progress', function() {
    return Ember.String.htmlSafe(`width: ${this.get('progress')}%;`);
  })
});
