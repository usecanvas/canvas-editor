import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import styles from './styles';

/**
 * A component representing the editable content of a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['editable-content', 'canvas-block-checklist-item-content'],
  styles
});
