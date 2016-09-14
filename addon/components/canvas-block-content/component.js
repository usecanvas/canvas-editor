import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentEditable from 'canvas-editor/mixins/content-editable';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a user-editable canvas block.
 *
 * @class CanvasEditor.CanvasBlockContentComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentEditable, {
  attributeBindings: ['placeholder:data-placeholder'],
  classNames: ['canvas-block-content'],
  classNameBindings: ['isEmptyClass'],
  isEmpty: computed.not('block.content'),
  localClassNames: ['component'],
  nextBlockConstructor: Paragraph,
  placeholder: computed.oneWay('block.meta.placeholder'),
  styles,

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
