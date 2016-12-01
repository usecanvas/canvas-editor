import Ember from 'ember';

import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import List from 'canvas-editor/lib/realtime-canvas/list';
import UnorderedLI from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';

const { run } = Ember;

/**
 * A mixin that includes the methods used by CanvasEditor.CanvasEditorComponent
 * for orchestrating block type changes.
 *
 * @class CanvasEditor.TypeChanges
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  /**
   * Change a checklist item to a paragraph.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:checklist-item/paragraph'(block, content) {
    return this['change:unordered-list-item/paragraph'](block, content);
  },

  /**
   * Change a checklist item to an unordered list item.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:checklist-item/unordered-list-item'(block, content) {
    return this['change:list-item/'](block, content, UnorderedLI);
  },

  /**
   * Change a list item to another list item.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   * @param {object} type The type to change the upload to
   */
  'change:list-item/'(block, content, type) {
    const parent = block.get('parent');
    const idx = parent.get('blocks').indexOf(block);
    const newBlock = type.createFromMarkdown(content, {
      id: block.get('id'),
      meta: { level: block.getWithDefault('meta.level', 1) },
      parent
    });
    this.get('onBlockDeletedLocally')(idx, block);
    this.get('onNewBlockInsertedLocally')(idx, newBlock);
    parent.get('blocks').replace(idx, 1, [newBlock]);
    run.scheduleOnce('afterRender', this, 'focusBlockStart', newBlock);
  },

  /**
   * Change a paragraph to a heading.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:paragraph/heading'(block, content) {
    const idx = this.get('blocks').indexOf(block);
    const newBlock =
      Heading.createFromMarkdown(content, { id: block.get('id') });
    this.get('onBlockDeletedLocally')(idx, block);
    this.get('onNewBlockInsertedLocally')(idx, newBlock);
    this.get('blocks').replace(idx, 1, [newBlock]);
    run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
  },

  /**
   * Change a paragraph to an unordered list item.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:paragraph/unordered-list-item'(block, content) {
    const idx = this.get('blocks').indexOf(block);
    this.get('onBlockDeletedLocally')(idx, block);
    const group = List.create({ blocks: Ember.A([block]) });
    block.setProperties({
      type: 'unordered-list-item',
      content: content.slice(2), // Remove Markdown prefix, e.g. "- ",
      meta: { level: 1 }
    });
    this.get('onNewBlockInsertedLocally')(idx, group);
    this.get('blocks').replace(idx, 1, [group]);
    run.scheduleOnce('afterRender', this, 'focusBlockStart', block);
  },

  /**
   * Change an unordered list item to a checklist item.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:unordered-list-item/checklist-item'(block, content) {
    return this['change:list-item/'](block, content, ChecklistItem);
  },

  /**
   * Change an unordered list item to a paragraph.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:unordered-list-item/paragraph'(block, content) {
    const paragraph = this.splitGroupWithContent(block, content);
    run.scheduleOnce('afterRender', this, 'focusBlockStart', paragraph);
  },

  /**
   * Change an upload to another type.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {object} type The type to change the upload to
   */
  'change:upload/'(block, type) {
    const idx = this.get('blocks').indexOf(block);
    const newBlock = type.create({ meta: { url: block.get('meta.url') } });
    this.get('onBlockDeletedLocally')(idx, block);
    this.get('onNewBlockInsertedLocally')(idx, newBlock);
    this.get('blocks').replace(idx, 1, [newBlock]);
    run.scheduleOnce('afterRender', this, 'selectCardBlock', newBlock);
  },

  /**
   * Change an upload to an image.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:upload/image'(block, _content) {
    this['change:upload/'](block, Image);
  },

  /**
   * Change an upload to a URL card.
   *
   * @method
   * @param {CanvasEditor.CanvasRealtime.Block} block The changed block
   * @param {string} content The content for the block after the change
   */
  'change:upload/url-card'(block, _content) {
    this['change:upload/'](block, URLCard);
  }
});
