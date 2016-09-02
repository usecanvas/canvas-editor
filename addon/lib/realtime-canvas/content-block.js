import Ember from 'ember';
import Block from './block';

const { computed } = Ember;

/**
 * A single block with content in a canvas.
 *
 * @class CanvasEditor.RealtimeCanvas.ContentBlock
 * @extends Ember.Object
 */
export default Block.extend({
  content: '',
  lastContent: '',
});
