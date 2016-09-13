import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

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
  styles,

  progress: computed('unfurl.meta.tasks_complete', 'unfurl.meta.tasks_total', function() {
    let tasksComplete = this.get('unfurl.meta.tasks_complete');
    let tasksTotal = this.get('unfurl.meta.tasks_total');
    if (tasksTotal === 0) {
      tasksComplete = 1;
      tasksTotal = 1;
    }
    return tasksComplete / tasksTotal * 100;
  })
});
