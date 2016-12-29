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

  input() {
    // Force a style recalculation to get rid of placeholder text in safari
    const el = this.contentElem();
    el.style.cssText += ';-webkit-transform:rotateZ(0deg)';
    Ember.K(el.offsetHeight);
    el.style.cssText += ';-webkit-transform:none';
  },

  doubleClick(evt) {
    // When double clicking inside an inline contenteditable, firefox overselects and
    // deletion no longer works, this method correctly selects the entire content
    if (this.contentElem().textContent !== '') {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectAllContent();
    }
  },

  mouseDown(evt) {
    if (this.contentElem().textContent === '') {
      const el = this.contentElem();
      const sel = window.getSelection();
      const rng = new Range();
      evt.preventDefault();
      evt.stopPropagation();
      el.focus();
      rng.setStart(el, 0);
      sel.removeAllRanges();
      sel.addRange(rng);
    }
  },

  selectAllContent() {
    const sel = window.getSelection();
    const rng = new Range();
    const el = this.contentElem();
    el.focus();
    rng.setStart(el, 0);
    rng.setEnd(el, el.childNodes.length);
    sel.removeAllRanges();
    sel.addRange(rng);
  },

  contentElem() {
    return this.$('span')[1];
  },

  keyDown(evt) {
    const key = new Key(evt.originalEvent);

    if (key.is('return')) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
});
