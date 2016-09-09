import Ember from 'ember';
import styles from './styles';

const { observer, on } = Ember;

/**
 * A component that renders a custom checkbox
 *
 * @class UICheckbox.UICheckboxComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  animateable: false,
  localClassNames: ['component'],
  localClassNameBindings: ['animateable:is-animateable', 'checked:is-checked'],
  styles,

  click() {
    this.get('onToggle')();
  },

  setAnimateable: on('willUpdate', function() {
    this.set('animateable', true);
  })
});
