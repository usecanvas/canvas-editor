import Ember from 'ember';
import Code from 'canvas-editor/lib/realtime-canvas/code';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import List from 'canvas-editor/lib/realtime-canvas/list';
import RunKitBlock from 'canvas-editor/lib/realtime-canvas/runkit';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import Title from 'canvas-editor/lib/realtime-canvas/title';
import Unknown from 'canvas-editor/lib/realtime-canvas/unknown';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import Tip from 'canvas-editor/lib/realtime-canvas/tip';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import Upload from 'canvas-editor/lib/realtime-canvas/upload';

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
          blocks: Ember.A(
            json.blocks.map(block => this.createBlockFromJSON(block))),
          meta: json.meta || Ember.Object.create()
        });
      } case 'image': {
        return Image.create(json);
      } case 'url': {
        return URLCard.create(json);
      } case 'tip': {
        return Tip.create(json);
      } case 'runkit': {
        return RunKitBlock.create(json);
      } case 'heading': {
        return Heading.create(json);
      } case 'horizontal-rule': {
        return HorizontalRule.create(json);
      } case 'code': {
        return Code.create(json);
      } case 'upload': {
        return Upload.create(json);
      } default: {
        return Unknown.create(Object.assign(json, { type: 'unknown' }));
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
