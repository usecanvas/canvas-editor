import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import styles from 'canvas-editor/components/canvas-block-editable/styles';

/**
 * A component representing the editable content of a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['editable-content', 'canvas-block-checklist-item-content'],
  localClassNames: ['component'],
  styles,
  nextBlockConstructor: ChecklistItem,

  newBlockInsertedLocally(content) {
    if (!this.get('block.content')) {
      return this.get('changeBlockType')(
        `${this.get('block.type')}/paragraph`, this.get('block'), content);
    }

    return this._super(...arguments);
  },
});
