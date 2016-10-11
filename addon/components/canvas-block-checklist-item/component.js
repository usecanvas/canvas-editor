import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentFilterable from 'canvas-editor/mixins/content-filterable';
import layout from './template';
import styles from './styles';

/**
 * A component representing a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentFilterable, {
  classNames: ['canvas-block-checklist-item'],
  layout,
  localClassNames: ['canvas-block-checklist-item'],
  styles,
  tagName: 'li',

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
