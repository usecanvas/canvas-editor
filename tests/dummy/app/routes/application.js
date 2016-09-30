import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Title from 'canvas-editor/lib/realtime-canvas/title';

const { A } = Ember;

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create({
      blocks: A([
        Title.create({ content: '' })
      ])
    });
  }
});
