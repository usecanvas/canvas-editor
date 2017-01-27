import Ember from 'ember';

export default Ember.Mixin.create({
  isFocused: false,
  localClassNameBindings: ['isFocused'],

  actions: {
    onBlur() {
      // If the blur event fires in the same run loop as contenteditable=false
      // gets set then this will trigger a rerender in the render queue which
      // is not allowed anymore.
      Ember.run.schedule('afterRender', _ => {
        this.set('isFocused', false);
      });
    },

    onFocus() {
      this.set('isFocused', true);
    }
  }
});
