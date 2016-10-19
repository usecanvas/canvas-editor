import BlockComponent from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import filterBlocks from 'canvas-editor/lib/filter-blocks';
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

  filteredBlocks: computed('block.blocks.[]', 'filterTerm', function() {
    return filterBlocks(this.get('block.blocks'), this.get('filterTerm'));
  })
});
