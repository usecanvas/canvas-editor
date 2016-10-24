import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import IndentableLevels from 'canvas-editor/mixins/indentable-levels';
import layout from './template';
import styles from './styles';

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(IndentableLevels, {
  classNames: ['canvas-block-unordered-list-item'],
  layout,
  levelClassPrefix: 'unordered-list-level',
  localClassNames: ['canvas-block-unordered-list-item'],
  styles,
  tagName: 'li'
});
