import Ember from 'ember';
import CanvasBlock from '../canvas-block/component';
import layout from './template';
import styles from './styles';
import { parseSymbolDefinition } from 'canvas-editor/lib/symbol/parser';

const { computed, inject } = Ember;

export default CanvasBlock.extend({
  classNames: ['canvas-block-symbol'],
  localClassNames: ['canvas-block-symbol'],
  layout,
  styles,
  setupSymbolPath: function() {
    const name = this.get('name') || this.get('block.meta.name');
    this.set('symbolPath', Ember.computed.alias(`symbol.symbols.${name}`));
  }.on('init'),

  symbol: inject.service(),
  blocks: computed('block.meta.name', 'symbolPath', function() {
    return parseSymbolDefinition(this.get('symbolPath') || '');
  }),

  checkboxBlocks: Ember.computed('blocks.[]', function() {
    return flatMapBy(this.get('blocks').filterBy('type', 'list'), 'blocks')
      .filterBy('type', 'checklist-item');
  }),

  applyCheckboxIndexes: function() {
    this.get('checkboxBlocks').forEach((b, i) => {
      b.set('idx_i', `_${i}`);
    });
  }.observes('checkboxBlocks').on('init'),

  symbolMetaReplacedLocally(path, key, oldValue, newValue) {
    const fullPath = `block.meta.${path}`;
    if (!this.get(fullPath)) {
      this.set(fullPath, {});
      this.get('onBlockMetaReplacedLocally')(
        this.get('block'),
        [path],
        null,
        this.get(fullPath));
    }

    this.set(`${fullPath}.${key}`, newValue);
    this.get('onBlockMetaReplacedLocally')(
      this.get('block'),
      [path, key],
      oldValue,
      newValue);
  },

  click(evt) {
    evt.stopPropagation();
  },

  mouseDown(evt) {
    evt.stopPropagation();
  },

  mouseMove(evt) {
    evt.stopPropagation();
  },

  mouseUp(evt) {
    evt.stopPropagation();
  },

  actions: {
    /**
     * Called when a block's content was updated in the editor.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The updated block
     */
    blockContentUpdatedLocally(/* block */) {
      Ember.K();
    },

    /**
     * Called when a block is deleted locally.
     *
     * If there is text remaining in the deleted block, it is joined onto the
     * previous block.
     *
     * @param {CanvasEditor.CanvasRealtime.Block} block The deleted block
     * @param {string} remainingContent The remaining content left in the block
     * @param {object} opts Options for deleting the block
     * @param {boolean} opts.onlySelf Only remove the given block, do not join
     *   remaining content
     */
    blockDeletedLocally(/* block, remainingContent = '', opts = {} */) {
      Ember.K();
    },

    /**
     * Called when a block's meta object was updated in the editor.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The updated block
     * @param {Array<*>} metaPath The path to the updated meta property
     * @param {*} oldValue The old meta value
     * @param {*} newValue The new meta value
     */
    blockMetaReplacedLocally(/* block, metaPath, oldValue, newValue */) {
      Ember.K();
    },

    /**
     * Called when the user replaced a block.
     *
     * TODO: With some fenagling, this can be replaced entirely by the
     * TypeChanges module.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   replaced
     * @param {CanvasEditor.CanvasRealtime.Block} newBlock The block that the
     *   user replaced with
     * @param {object} [opts={}] Options object
     * @param {boolean} opts.focus Whether to focus the replacing block
     */
    blockReplacedLocally(/* block, newBlock, opts = {} */) {
      Ember.K();
    },

    /**
     * Called when a block's type was changed in the editor.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The updated block
     */
    blockTypeUpdatedLocally(/* block */) {
      Ember.K();
    },

    /**
     * Called when a card unfurls—we increment the `cardLoadIndex` to allow
     * filtering of their content.
     *
     * @method
     */
    cardDidLoad() {
      Ember.K();
    },

    /**
     * Called when a block's type is changed.
     *
     * This calls the `change:BEFORE/AFTER` methods defined on the typeChange
     * mixin.
     *
     * @method
     * @param {string} typeChange A string representing the "before/after" types
     *   of the block
     * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
     * @param {string} content The content for the block after the change (this
     *   is important for when we need to strip Markdown prefixes like "- [ ]")
     */
    changeBlockType(/* typeChange, block, content */) {
      Ember.K();
    },

    chunkInput({ key }, newValue) {
      const oldValue = this.get(`block.meta.chunks.${key}`) || null;
      this.symbolMetaReplacedLocally('chunks', key, oldValue, newValue);
    },

    checkboxToggle(key, oldValue) {
      const newValue = !oldValue;
      this.symbolMetaReplacedLocally('checkboxes', key, oldValue, newValue);
    },

    /**
     * Called when a user selects all twice.
     *
     * We first select all text in a block, and now we do a multi-block
     * selection of the entire canvas.
     *
     * @method
     */
    doubleSelectAll() {
      Ember.K();
    },

    /**
     * Called when a user selects to the end twice.
     *
     * @method
     */
    doubleSelectToEnd(/* block */) {
      Ember.K();
    },

    /**
     * Called when a user selects to the start twice.
     *
     * @method
     */
    doubleSelectToStart(/* block */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to multi-block select down from the given
     * block.
     *
     * @method
     * @param {CanvasEditor.RealtimeCanvas.Block} block The block to select down
     *   from
     */
    multiBlockSelectDown(/* block */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to multi-block select up from the given
     * block.
     *
     * @method
     * @param {CanvasEditor.RealtimeCanvas.Block} block The block to select up
     *   from
     */
    multiBlockSelectUp(/* block */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to navigate down to the next block from the
     * currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate down *from*
     * @param {ClientRect} rangeRect The client rect for the current user range
     */
    navigateDown(/* block, rangeRect */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to navigate to the end of the block before
     * the currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate *from*
     */
    navigateLeft(/* block */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to navigate to the start of the block after
     * the currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate *from*
     */
    navigateRight(/* block */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to navigate up to the previous block from the
     * currently focused block.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block that the user
     *   wishes to navigate up *from*
     * @param {ClientRect} rangeRect The client rect for the current user range
     */
    navigateUp(/* block , rangeRect */) {
      Ember.K();
    },

    /**
     * Called when a new block was added after `prevBlock` and the canvas model
     * needs to be updated.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} prevBlock The block that the
     *   new block should be inserted after
     * @param {CanvasEditor.CanvasRealtime.Block} newBlock The new block
     */
    newBlockInsertedLocally(/* prevBlock, newBlock */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to "redo" the last operation.
     *
     * @method redo
     * @param {jQuery.Event} evt The `redo` event
     */
    redo(/* evt */) {
      Ember.K();
    },

    /**
     * Swap the block and its previous sibling.
     *
     * @method
     * @param {CanvasEditor.CanvasRealtime.Block} block The block to swap
     */
    swapBlockUp(/* block */) {
      Ember.K();
    },

    /**
     * Called when a template should be applied to the canvas.
     *
     * @method
     * @param {CanvasEditor.RealtimeCanvas} template A template to apply to the
     *   canvas
     */
    templateApply(/* template */) {
      Ember.K();
    },

    /**
     * Called when the user wishes to "undo" the last operation.
     *
     * @method
     * @param {jQuery.Event} evt The `undo` event
     */
    undo(/* evt */) {
      Ember.K();
    }
  },
});

function flatMapBy(arr, prop) {
  return [].concat(...arr.mapBy(prop));
}
