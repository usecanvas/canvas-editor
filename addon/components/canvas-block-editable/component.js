import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentEditable from 'canvas-editor/mixins/content-editable';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a user-editable canvas block.
 *
 * @class CanvasEditor.CanvasBlockEditableComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentEditable, {
  attributeBindings: ['block.meta.placeholder:data-placeholder'],
  classNames: ['canvas-block-editable'],
  isEmpty: computed.not('block.content'),
  localClassNames: ['component'],
  localClassNameBindings: ['isEmpty'],
  nextBlockConstructor: Paragraph,
  styles
});
