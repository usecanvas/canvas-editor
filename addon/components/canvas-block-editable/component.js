import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentEditable from 'canvas-editor/mixins/content-editable';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import styles from './styles';

/**
 * A component representing a user-editable canvas block.
 *
 * @class CanvasEditor.CanvasBlockEditableComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentEditable, {
  classNames: ['canvas-block-editable'],
  localClassNames: ['component'],
  nextBlockConstructor: Paragraph,
  styles
});
