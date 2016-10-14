import ContentBlock from './content-block';
import Ember from 'ember';

const { computed } = Ember;

/**
 * A block representing a code block.
 *
 * @class CanvasEditor.RealtimeCanvas.Code
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'code',
  meta: computed(_ => Ember.Object.create({ language: null }))
});
