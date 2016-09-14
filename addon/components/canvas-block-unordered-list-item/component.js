import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import UnorderedList from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import styles from './styles';

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListItemComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['canvas-block-unordered-list-item'],
  localClassNames: ['component'],
  nextBlockConstructor: UnorderedList,
  styles,
  tagName: 'li',

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
        `unordered-list-item/${type}`, this.get('block'), content);
    } else {
      this._super(content, preventRerender);
    }
  }
});

function getNewType(content) {
  if (isChecklistItem(content)) {
    return 'checklist-item';
  }

  return null;
}

function isChecklistItem(content) {
  return (/^\[[ Xx]\]\s/).test(content);
}
