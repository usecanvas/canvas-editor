import Ember from 'ember';
export default Ember.Mixin.create({
  indentBlock: Ember.K,
  unindentBlock: Ember.K,

  keyDown(evt) {
    if (evt.keyCode === 9) {
      evt.preventDefault();
      evt.stopPropagation();

      if (evt.shiftKey) {
        this.get('unindentBlock')();
      } else {
        this.get('indentBlock')();
      }
    } else {
      this._super(...arguments);
    }
  }
});
