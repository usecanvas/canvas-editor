import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import layout from './template';
import styles from './styles';

/**
 * A component representing an Unknown card.
 *
 * @class CanvasEditor.CanvasBlockUnknownComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  layout,
  localClassNames: ['canvas-block-unknown'],
  styles
});
