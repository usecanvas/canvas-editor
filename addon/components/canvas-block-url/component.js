import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import layout from './template';
import styles from './styles';

/**
 * A component representing a URL card.
 *
 * @class CanvasEditor.CanvasBlockURLComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  classNames: ['canvas-block-url'],
  layout,
  localClassNames: ['canvas-block-url'],
  localClassNameBindings: ['showAuthComponent:component--needs-auth'],
  styles,

  image: '/canvas-editor/images/sample.png'
});
