import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  layout,
  localClassNames: ['component'],
  radius: 14,
  styles,

  circumference: computed('radius', function() {
    return this.get('radius') * 2 * Math.PI;
  }),

  percentage: computed('circumference', 'progress', function() {
    return this.get('circumference') * ((this.get('progress') - 100) / 100);
  })
});
