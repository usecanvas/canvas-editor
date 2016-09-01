import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import UnorderedList from 'canvas-editor/lib/realtime-canvas/unordered-list';
import styles from './styles';

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  tagName: 'li',
  localClassNames: 'canvas-block-unordered-list',
  styles,
  nextBlockConstructor: UnorderedList
});
