import Ember from 'ember';
import Key from 'canvas-editor/lib/key';
import layout from './template';
import styles from './styles';

const { computed, observer, on, run } = Ember;

/**
 * This component is a cross-browser contenteditable span that works around bad
 * browser behaviour. It consists of two empty spans around the content to help
 * firefox and chrome figure out the navigation boundariers and a span
 * containing the placeholder text as the browsers break even more with
 * pseudoelements.
 *
 * @class CanvasEditor.CanvasInlineEditableComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  /*
   * SIMPLE PROPERTIES
   * =================
   */

  /**
   * @member {object} The component layout template
   */
  layout,

  /**
   * @member {Array<string>} Non-localized class names
   */
  localClassNames: ['canvas-inline-editable'],

  /**
   * @member {string} HTML tag name for this component
   */
  tagName: 'span',

  /**
   * @member {object} The component styles
   */
  styles,

  /*
   * COMPUTED PROPERTIES
   * ===================
   */

  /**
   * @member {Element} The component's content element
   */
  contentElement: computed(function() {
    return this.$(`.${this.styles.content}`).get(0);
  }).volatile(),

  /**
   * @member {string} The component's content element content
   */
  contentElementText: computed(function() {
    const element = this.get('contentElement');
    return element.innerText || element.textContent;
  }).volatile(),

  /*
   * METHODS
   * =======
   */

  /*
   * Observers
   * ---------
   */

  /**
   * Observer called when the symbol value changes to (potentially) update
   * the DOM with the new value.
   *
   * @method
   */
  onSymbolValueChange: observer('symbolValue', function() {
    this.initContentElementText();
  }),

  /*
   * DOM Event Hooks
   * ---------------
   */

  /**
   * Handle an input event in the inline contenteditable.
   *
   * @method
   * @param {jQuery.Event} evt The input event
   */
  input(evt) {
    evt.stopPropagation();
    // Force a style recalculation to get rid of placeholder text in safari
    const el = this.get('contentElement');
    el.style.cssText += ';-webkit-transform:rotateZ(0deg)';
    Ember.K(el.offsetHeight);
    el.style.cssText += ';-webkit-transform:none';

    const text = this.get('contentElementText');

    this.set('isUpdatingContent', true);
    this.get('onInput')(this.get('chunk'), text);
    run.scheduleOnce('afterRender', this, 'set', 'isUpdatingContent', false);
  },

  /**
   * Handle a doubleclick in the inline contenteditable.
   *
   * When double clicking inside an inline contenteditable, FireFox
   * overselects and deletion no longer works, this method correctly selects the
   * entire content
   *
   * @method
   * @param {jQuery.Event} evt The dbclick event
   */
  doubleClick(evt) {
    if (this.get('contentElementText') !== '') {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectAllContent();
    }
  },

  /**
   * Handle a keydown event and prevent "return".
   *
   * @method
   * @param {jQuery.Event} evt The keydown event
   */
  keyDown(evt) {
    const key = new Key(evt.originalEvent);

    if (key.is('return')) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  },

  /**
   * Handle a mousedown event.
   *
   * @method
   * @param {jQuery.Event} evt The mousedown event
   */
  mouseDown(evt) {
    if (this.get('contentElementText') === '') {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectAllContent();
    }
  },

  /*
   * Lifecycle Hooks
   * ---------------
   */

  /**
   * Initialize the content element text by updating the DOM.
   *
   * @method
   */
  initContentElementText: on('didInsertElement', function() {
    this.setContentElementText();
  }),

  /*
   * Regular Methods
   * ---------------
   */

  /**
   * Select all content in the element.
   *
   * @method
   */
  selectAllContent() {
    const sel = window.getSelection();
    const rng = new Range();
    const el = this.get('contentElement');
    el.focus();
    rng.setStart(el, 0);
    rng.setEnd(el, el.childNodes.length);
    sel.removeAllRanges();
    sel.addRange(rng);
  },

  /**
   * Set the content element text from the current symbol value if not
   * mid-update.
   *
   * @method
   */
  setContentElementText() {
    if (this.get('isUpdatingContent')) return;
    const element = this.get('contentElement');
    const value = this.get('symbolValue');
    Ember.$(element).text(value);
  }
});
