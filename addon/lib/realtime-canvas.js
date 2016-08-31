import Ember from 'ember';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import Title from 'canvas-editor/lib/realtime-canvas/title';

const { computed } = Ember;

/**
 * A canvas that is editable in realtime through the manipulation of its blocks.
 *
 * @class CanvasEdito.RealtimeCanvas
 * @extends Ember.Object
 */
export default Ember.Object.extend({
  blocks: computed(_ => Ember.A([]))
}).reopenClass({
  createBlockFromJSON(json) {
    switch (json.type) {
    case 'paragraph':
      return Paragraph.create(json);
    case 'title':
      return Title.create(json);
    default:
      throw new Error(`Unrecognized block type: "${json.type}".`);
    }
  }
});
