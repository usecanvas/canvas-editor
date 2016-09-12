import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import layout from './template';
import styles from './styles';

/**
 * A component representing a Canvas card.
 *
 * @class CanvasEditor.CanvasBlockCanvasComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  classNames: ['canvas-block-canvas'],
  layout,
  localClassNames: ['component'],
  styles
});
