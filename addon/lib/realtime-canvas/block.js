import Ember from 'ember';
import Base62UUID from 'canvas-editor/lib/base62-uuid';

const { computed } = Ember;

/**
 * A single block in a canvas.
 *
 * @class CanvasEditor.RealtimeCanvas.Block
 * @extends Ember.Object
 */
export default Ember.Object.extend({
  id: computed(_ => Base62UUID.generate()),
  meta: computed(_ => Ember.Object.create()),
  toJSON({ serializeId = false } = {}) {
    const properties = ['blocks', 'isGroup', 'meta', 'type', 'isCard',
      'content'];
    if (serializeId) {
      return this.getProperties('id', ...properties);
    }
    return this.getProperties(...properties);
  }
}).reopenClass({
  /* eslint-disable no-unused-vars */
  /**
   * Create a new instance of this class from the given Markdown string and with
   * the given properties.
   *
   * This method parses the given markdown (and assumes it matches this block
   * type) and creates a new instance of the class based off of it. It also
   * accepts additional properties which can be applied.
   *
   * ```javascript
   * ChecklistItem.createFromMarkdown(
   *   '- [X] Foo',
   *   { id: '123' });
   *
   * // Instance of a checked checklist item with ID '123'.
   * ```
   *
   * @method
   * @static
   * @param {string} markdown The Markdown used to create the block
   * @param {object} properties Additional properties to apply to the block
   */
  createFromMarkdown(markdown, properties) {
    throw new Error('Class has not implemented `createFromMarkdown`.');
  }
  /* eslint-enable no-unused-vars */
});
