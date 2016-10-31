import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import layout from './template';
import styles from './styles';

/**
 * A component representing a pending upload.
 *
 * @class CanvasEditor.CanvasBlockUploadComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  classNames: ['canvas-block-upload'],
  layout,
  localClassNames: ['canvas-block-upload'],
  styles,

  progress: 34
});
