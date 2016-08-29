import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import styles from './styles';

/**
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  localClassNames: 'canvas-block-paragraph',
  styles
});
