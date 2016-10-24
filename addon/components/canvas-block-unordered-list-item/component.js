import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a "unordered list" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-unordered-list-item'],
  classNameBindings: ['levelClass'],
  layout,
  localClassNames: ['canvas-block-unordered-list-item'],
  styles,
  tagName: 'li',

  levelClass: computed('block.meta.level', function() {
    return this.get('styles')[`unordered-list-level-${this.get('block.meta.level')}`];
  }),

  offsetLevel(offset) {
    const level = this.getWithDefault('block.meta.level', 1);
    const newLevel = Math.max(1, Math.min(4, offset + level));
    this.set('block.meta.level' , newLevel);
  },
});
