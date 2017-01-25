import BlockEvents from 'canvas-editor/mixins/block-events';
import Ember from 'ember';
import ContentEditable from 'canvas-editor/mixins/content-editable';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import styles from './styles';

const { computed, run } = Ember;

/**
 * A component representing a user-editable canvas block.
 *
 * @class CanvasEditor.CanvasBlockEditableComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(BlockEvents, ContentEditable, {
  attributeBindings: ['placeholder:data-placeholder'],
  classNames: ['canvas-block-editable'],
  isEmpty: computed.not('block.content'),
  localClassNames: ['canvas-block-editable'],
  localClassNameBindings: ['isEmpty', 'isFocused', 'isSelected'],
  nextBlockConstructor: Paragraph,
  placeholder: computed.oneWay('block.meta.placeholder'),
  styles,

  didInsertElement() {
    this.$().on('focus', run.bind(this, 'focus'));
    this.$().on('blur', run.bind(this, 'blur'));
  },

  blur() {
    this.get('onBlurBlock')();
  },

  focus() {
    this.get('onFocusBlock')();
  }
});
