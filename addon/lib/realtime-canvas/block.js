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
  meta: computed(_ => Ember.Object.create())
});
