import Ember from 'ember';
import styles from './styles';

/**
 * A component that renders a custom checkbox
 *
 * @class UICheckbox.UICheckboxComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  isChecked: false,
  localClassNames: ['component'],
  localClassNameBindings: ['checked:is-checked'],
  styles
});
