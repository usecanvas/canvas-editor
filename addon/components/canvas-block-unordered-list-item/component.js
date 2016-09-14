import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import UnorderedList from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import layout from './template';
import styles from './styles';

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-unordered-list-item'],
  layout,
  localClassNames: ['component'],
  styles,
  tagName: 'li'
});
