import Ember from 'ember';
import layout from './template';
import styles from './styles';

export default Ember.Component.extend({
  layout,
  styles,

  onChange: Ember.K,

  didInsertElement() {
    this.set('oldValue', this.get('value'));
  },

  actions: {
    onChange() {
      const oldValue = this.get('oldValue');
      const newValue = this.get('value');
      this.set('oldValue', newValue);
      this.get('onChange')(oldValue, newValue);
    }
  }
});
