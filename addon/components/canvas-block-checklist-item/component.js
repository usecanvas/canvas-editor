import Ember from 'ember';
import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import IndentableLevels from 'canvas-editor/mixins/indentable-levels';
import layout from './template';
import styles from './styles';

/**
 * A component representing a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(IndentableLevels, {
  classNames: ['canvas-block-checklist-item'],
  layout,
  localClassNames: ['canvas-block-checklist-item'],
  styles,
  tagName: 'li',

  checked: Ember.computed('block.meta.checked', 'idx_i', function() {
    const metaChecked = this.get('idx_i');
    /* eslint-disable no-undefined */
    return metaChecked === undefined ? this.get('block.meta.checked')
      : metaChecked;
  }),

  setupIdxPath: function() {
    this.set('idx_i',
      Ember.computed.alias(`checkboxes.idx_${this.get('block.idx_i')}`));
  }.observes('block.idx_i', 'checkboxes').on('init'),

  actions: {
    onToggleChecked() {
      if (this.get('onCheckboxToggle')) {
        this.get('onCheckboxToggle')(this.get('block'), this.get('checked'));
        return;
      }
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
