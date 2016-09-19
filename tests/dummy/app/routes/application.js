import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import List from 'canvas-editor/lib/realtime-canvas/list';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import CanvasCard from 'canvas-editor/lib/realtime-canvas/canvas-card';
import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Title from 'canvas-editor/lib/realtime-canvas/title';
import Tip from 'canvas-editor/lib/realtime-canvas/tip';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';

const { A } = Ember;

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create({
      blocks: A([
        Title.create({ content: 'The Title' })
      ])
    });
  }
});
