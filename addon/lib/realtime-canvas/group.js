import Ember from 'ember';
import Base62UUID from 'canvas-editor/lib/base62-uuid';

const { computed } = Ember;

/**
 * A group in a canvas.
 *
 * @class CanvasEditor.RealtimeCanvas.Group
 * @extends Ember.Object
 */
export default Ember.Object.extend({
  id: computed(_ => Base62UUID.generate()),
  blocks: computed(_ => []),
  meta: computed(_ => Ember.Object.create()),
  type: 'group'
});
