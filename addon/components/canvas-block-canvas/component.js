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
  localClassNames: ['canvas-block-canvas'],
  styles,

  hasProgress: computed('progress', function() {
    return typeof this.get('progress') === 'number';
  }),

  progress: computed('unfurl.fields', function() {
    const field = Ember.A(this.get('unfurl.fields'))
      .findBy('title', 'progress');
    if (!field) return null;
    return field.value;
  })
});
