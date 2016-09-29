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
  localClassNameBindings: ['showAuthComponent:component--needs-auth'],
  localClassNames: ['canvas-block-url'],
  styles
});
