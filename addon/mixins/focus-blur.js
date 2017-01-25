import Ember from 'ember';

export default Ember.Mixin.create({
  isFocused: false,

  actions: {
    onBlur() {
      this.set('isFocused', false);
    },

    onFocus() {
      this.set('isFocused', true);
    }
  }
});
