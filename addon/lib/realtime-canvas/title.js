import Block from './content-block';
import Ember from 'ember';

const { computed } = Ember;

/**
 * A block representing a paragraph.
 *
 * @class CanvasEditor.RealtimeCanvas.Paragraph
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  type: 'title',
  content: '',
  lastContent: ''
});
