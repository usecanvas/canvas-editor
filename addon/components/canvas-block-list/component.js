import BlockComponent from 'canvas-editor/components/canvas-block/component';
import layout from './template';
import styles from './styles';

/**
 * A component for rendering lists.
 *
 * @class CanvasEditor.CanvasBlockListComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default BlockComponent.extend({
  classNames: ['canvas-block-list'],
  localClassNames: ['component'],
  layout,
  styles,
  tagName: 'ul'
});
