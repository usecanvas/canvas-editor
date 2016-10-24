import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-checklist-item'],
  classNameBindings: ['levelClass'],
  layout,
  localClassNames: ['canvas-block-checklist-item'],
  styles,
  tagName: 'li',

  levelClass: computed('block.meta.level', function() {
    return this.get('styles')[`checklist-level-${this.get('block.meta.level')}`];
  }),

  offsetLevel(offset) {
    const oldLevel = this.getWithDefault('block.meta.level', 1);
    const newLevel = Math.max(1, Math.min(4, offset + oldLevel));
    if (oldLevel !== newLevel) {
      this.set('block.meta.level', newLevel);
      this.get('onBlockMetaReplacedLocally')(
        this.get('block'),
        ['level'],
        oldLevel,
        newLevel);
    }
  },

  actions: {
    onToggleChecked() {
      if (!this.get('editingEnabled')) return;

      const oldValue = this.get('block.meta.checked');
      this.toggleProperty('block.meta.checked');
      this.get('onBlockMetaReplacedLocally')(
        this.get('block'),
        ['checked'],
        oldValue,
        this.get('block.meta.checked'));
    }
  }
});
