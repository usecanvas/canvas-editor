import Ember from 'ember';
import styles from './styles';

const { on } = Ember;

/**
 * A component that renders a custom checkbox
 *
 * @class UICheckbox.UICheckboxComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  isAnimateable: false,
  localClassNames: ['ui-checkbox'],
  localClassNameBindings: [
    'isAnimateable',
    'checked:is-checked',
    'isFocused'
  ],
  styles,

  click() {
    this.get('onToggle')(this.get('checked'));
  },

  setAnimateable: on('willUpdate', function() {
    this.set('isAnimateable', true);
  })
});
