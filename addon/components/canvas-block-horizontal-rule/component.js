import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import NoFilterable from 'canvas-editor/mixins/no-filterable';
import styles from './styles';

/**
 * A component representing a horizontalrule.
 *
 * @class CanvasEditor.CanvasBlockHorizontalRuleComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend(NoFilterable, {
  classNames: ['canvas-block-horizontal-rule'],
  localClassNames: ['canvas-block-horizontal-rule'],
  styles
});
