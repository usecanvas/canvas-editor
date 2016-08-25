import Ember from 'ember';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';

export default Ember.Route.extend({
  model() {
    return RealtimeCanvas.create();
  }
});
