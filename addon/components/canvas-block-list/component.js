import BlockComponent from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A component for rendering lists.
 *
 * @class CanvasEditor.CanvasBlockListComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default BlockComponent.extend({
  classNames: ['canvas-block-list'],
  localClassNames: ['canvas-block-list'],
  layout,
  styles,
  tagName: 'ul',

  isFiltered: computed('filterTerm', function() {
    const term = (this.get('filterTerm') || '').toLowerCase();
    if (!term) return true;

    return this.get('block.blocks').any(block => {
      return block.get('content').toLowerCase().includes(term);
    });
  })
});
