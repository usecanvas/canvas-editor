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
  tagName: 'li',
  localClassNames: ['canvas-block-unordered-list-item'],
  classNames: ['canvas-block-unordered-list-item'],
  styles,
  nextBlockConstructor: UnorderedList,

  newBlockInsertedLocally(content) {
    if (!this.get('block.content')) {
      return this.get('changeBlockType')(
        `${this.get('block.type')}/paragraph`, this.get('block'), content);
    }

    return this._super(...arguments);
  }
});
