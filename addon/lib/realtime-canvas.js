import Ember from 'ember';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import CanvasCard from 'canvas-editor/lib/realtime-canvas/canvas-card';
import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import List from 'canvas-editor/lib/realtime-canvas/list';
import Title from 'canvas-editor/lib/realtime-canvas/title';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import Tip from 'canvas-editor/lib/realtime-canvas/tip';

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
    json = clone(json);

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
      } case 'canvas': {
        return CanvasCard.create(json);
      } case 'url': {
        return URLCard.create(json);
      } case 'tip': {
        return Tip.create(json);
      } default: {
        throw new Error(`Unrecognized block type: "${json.type}".`);
      }
    }
  }
});

function clone(json) {
  if (Array.isArray(json)) {
    return json.map(clone);
  }

  if (!json) {
    return json;
  }

  if (typeof json === 'object') {
    return Object.keys(json).reduce((object, key) => {
      object[key] = clone(json[key]);
      return object;
    }, {});
  }

  return json;
}
