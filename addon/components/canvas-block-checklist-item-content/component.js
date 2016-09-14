import CanvasBlockContent from 'canvas-editor/components/canvas-block-content/component';
import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import styles from './styles';

/**
 * A component representing the editable content of a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemContentComponent
 * @extends CanvasEditor.CanvasBlockContentComponent
 */
export default CanvasBlockContent.extend({
  classNames: ['canvas-block-checklist-item-content', 'editable-content'],
  localClassNames: ['component'],
  nextBlockConstructor: ChecklistItem,
  styles,

  newBlockInsertedLocally(content) {
    if (!this.get('block.content')) {
      return this.get('changeBlockType')(
        `${this.get('block.type')}/paragraph`, this.get('block'), content);
    }

    return this._super(...arguments);
  },

  setBlockContentFromInput(content, preventRerender = true) {
    const type = getNewType(content);

    if (type) {
      this.get('changeBlockType')(
        `${this.get('block.type')}/${type}`, this.get('block'), content);
    } else {
      this._super(content, preventRerender);
    }
  }
});

function getNewType(content) {
  if (isUnorderedListItem(content)) {
    return 'unordered-list-item';
  }

  return null;
}

function isUnorderedListItem(content) {
  return (/^-\s/).test(content);
}
