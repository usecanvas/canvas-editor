import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

/**
 * A component representing a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default Ember.Component.extend({
  classNames: ['canvas-block-checklist-item'],
  layout,
  localClassNames: ['component'],
  nextBlockConstructor: ChecklistItem,
  styles,
  tagName: 'li',

  actions: {
    onToggleChecked() {
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
