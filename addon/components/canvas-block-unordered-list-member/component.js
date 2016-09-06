import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import UnorderedList from 'canvas-editor/lib/realtime-canvas/unordered-list-group';
import styles from './styles';

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListMemberComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  tagName: 'li',
  localClassNames: 'canvas-block-unordered-list-member',
  styles,
  nextBlockConstructor: UnorderedList
});
