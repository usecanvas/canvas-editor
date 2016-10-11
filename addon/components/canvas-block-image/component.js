import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import NoFilterable from 'canvas-editor/mixins/no-filterable';
import layout from './template';
import styles from './styles';

/**
 * A component representing an image.
 *
 * @class CanvasEditor.CanvasBlockImageComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend(NoFilterable, {
  classNames: ['canvas-block-image'],
  layout,
  localClassNames: ['canvas-block-image'],
  styles
});
