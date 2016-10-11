import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentFilterable from 'canvas-editor/mixins/content-filterable';
import layout from './template';
import styles from './styles';

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentFilterable, {
  classNames: ['canvas-block-unordered-list-item'],
  layout,
  localClassNames: ['canvas-block-unordered-list-item'],
  styles,
  tagName: 'li'
});
