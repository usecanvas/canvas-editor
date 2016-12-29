import Ember from 'ember';
import Key from 'canvas-editor/lib/key';
import layout from './template';
import styles from './styles';

export default Ember.Component.extend({
  classNames: ['canvas-inline-editable'],
  localClassNames: ['canvas-inline-editable'],
  tagName: 'span',
  layout,
  styles,
  counter: 0,
  input() {
    // Force a style recalculation to get rid of placeholder text in safari
    const el = this.$('span')[0];
    el.style.cssText += ';-webkit-transform:rotateZ(0deg)';
    Ember.K(el.offsetHeight);
    el.style.cssText += ';-webkit-transform:none';
  },

  keyDown(evt) {
    const key = new Key(evt.originalEvent);

    if (key.is('return')) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
});
