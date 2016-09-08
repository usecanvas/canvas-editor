import Ember from 'ember';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import List from 'canvas-editor/lib/realtime-canvas/list';
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
    json.meta = clone(json.meta);

    switch (json.type) {
      case 'paragraph': {
        return Paragraph.create(json);
      } case 'title': {
        return Title.create(json);
      } case 'unordered-list-item': {
        return ULItem.create(json);
      } case 'checklist-item': {
        return CLItem.create(json);
      } case 'list': {
        return List.create({
          blocks: json.blocks.map(block => this.createBlockFromJSON(block)),
          meta: json.meta
        });
      } default: {
        throw new Error(`Unrecognized block type: "${json.type}".`);
      }
    }
  }
});

function clone(json) {
  return JSON.parse(JSON.stringify(json));
}
