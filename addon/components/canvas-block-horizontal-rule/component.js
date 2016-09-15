import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import Ember from 'ember';
import styles from './styles';

/**
 * A component representing a horizontalrule.
 *
 * @class CanvasEditor.CanvasBlockHorizontalRuleComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  classNames: ['canvas-block-horizontal-rule'],
  localClassNames: ['component'],
  styles,
  doUnfurl: Ember.K
});
