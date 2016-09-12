import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import layout from './template';
import styles from './styles';

/**
 * A component representing a Canvas card.
 *
 * @class CanvasEditor.CanvasBlockCanvasComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-canvas'],
  layout,
  localClassNames: ['component'],
  styles
});
