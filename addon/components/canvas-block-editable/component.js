import BlockEvents from 'canvas-editor/mixins/block-events';
import Ember from 'ember';
import ContentEditable from 'canvas-editor/mixins/content-editable';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a user-editable canvas block.
 *
 * @class CanvasEditor.CanvasBlockEditableComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(BlockEvents, ContentEditable, {
  attributeBindings: ['placeholder:data-placeholder'],
  classNames: ['canvas-block-editable'],
  classNameBindings: ['isEmptyClass'],
  isEmpty: computed.not('block.content'),
  localClassNames: ['component'],
  nextBlockConstructor: Paragraph,
  placeholder: computed.oneWay('block.meta.placeholder'),
  styles,

  didInsertElement() {
    this.$().on('focus', this.focus.bind(this));
    this.$().on('blur', this.blur.bind(this));
  },

  blur() {
    this.set('isFocused', false);
  },

  focus() {
    this.set('isFocused', true);
  },

  /**
   * @property {String} isEmptyClass Dynamic CSS class applied if isEmpty is
   * true.
   *
   * This should be a `localClassNameBindings` but currently requires a computed
   * property until this issue gets resolved:
   * https://github.com/salsify/ember-css-modules/issues/48
   */
  isEmptyClass: computed('isEmpty', function() {
    return this.get('isEmpty') ? this.get('styles.is-empty') : ''
  })
});
