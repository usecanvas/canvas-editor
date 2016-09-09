import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import layout from './template';
import styles from './styles';

/**
 * A component representing a URL card.
 *
 * @class CanvasEditor.CanvasBlockURLComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-url'],
  layout,
  localClassNames: ['component'],
  styles
});
