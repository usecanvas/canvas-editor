import Ember from 'ember';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import UnorderedList from 'canvas-editor/lib/realtime-canvas/unordered-list-member';
import UnorderedGroupList from 'canvas-editor/lib/realtime-canvas/unordered-list-group';
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
      case 'paragraph': {
        return Paragraph.create(json);
      } case 'title': {
        return Title.create(json);
      } case 'unordered-list-member': {
        return UnorderedList.create(json);
      } case 'unordered-list-group': {
        const group = UnorderedGroupList.create(json);
        group.set('blocks', json.blocks.map(blockJSON => {
          return this.createBlockFromJSON(
            Object.assign({ parent: group }, blockJSON));
        }));
        return group;
      } default: {
        throw new Error(`Unrecognized block type: "${json.type}".`);
      }
    }
  }
});
