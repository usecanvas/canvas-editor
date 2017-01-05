import Ember from 'ember';
import Key from 'canvas-editor/lib/key';
import SelectionState from 'canvas-editor/lib/selection-state';
import layout from './template';
import styles from './styles';

const isFirefox = window.navigator.userAgent.includes('Firefox');
const { computed } = Ember;

/**
 * This component is a cross-browser contenteditable span that works around bad
 * browser behaviour. It consists of two empty spans around the content to help
 * firefox and chrome figure out the navigation boundariers and a span
 * containing the placeholder text as the browsers break even more with
 * pseudoelements.
 */
export default Ember.Component.extend({
  classNames: ['canvas-inline-editable'],
  localClassNames: ['canvas-inline-editable'],
  tagName: 'span',
  layout,
  styles,

  selectionState: computed(function() {
    return new SelectionState(this.contentElem());
  }),

  input(evt) {
    evt.stopPropagation();
    // Force a style recalculation to get rid of placeholder text in safari
    const el = this.contentElem();
    el.style.cssText += ';-webkit-transform:rotateZ(0deg)';
    Ember.K(el.offsetHeight);
    el.style.cssText += ';-webkit-transform:none';
  },

  doubleClick(evt) {
    // When double clicking inside an inline contenteditable, firefox
    // overselects and deletion no longer works, this method correctly selects
    // the entire content
    if (this.contentElem().textContent !== '') {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectAllContent();
    }
  },

  mouseDown(evt) {
    if (this.contentElem().textContent === '') {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectAllContent();
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

  getElementText() {
    const element = this.contentElem();
    if (element.childNodes.length === 1 &&
        element.firstChild.nodeName === 'BR') return '';
    let text = element.innerText || element.textContent;
    // Firefox appends a <br> to the end of contenteditable
    if (isFirefox) text = text.replace(/\n$/, '');
    return text;
  },

  keyDown(evt) {
    const key = new Key(evt.originalEvent);

    if (key.is('return')) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
});
