import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import styles from './styles';

/**
 * A component representing a "title" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockTitleComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  localClassNames: ['canvas-block-title'],
  styles
});
