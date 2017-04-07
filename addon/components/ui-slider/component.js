import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { on } = Ember;

/**
 * A component that displays a slider to adjust a value.
 *
 * @class CanvasEditor.UISliderComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  layout,
  styles,

  /**
   * Initialize the `oldValue` to the original value.
   *
   * @method
   */
  initOldvalue: on('didInsertElement', function() {
    this.set('oldValue', this.get('value'));
  }),

  actions: {
    /**
     * Action called when the value changes—send the `onChange` event.
     *
     * @method
     * @param {string} value The new value
     */
    updateValue(value) {
      const oldValue = this.get('value');
      const newValue = value;
      this.set('oldValue', newValue);
      this.set('value', value);
      this.get('onChange')(oldValue, newValue);
    }
  },

  /**
   * Dummy for action called when the slider value changes.
   *
   * @method
   * @param {number} oldValue The old value
   * @param {number} newValue The new value
   */
  onChange() {},
});
