import Block from './content-block';
import Ember from 'ember';

const { computed } = Ember;

/**
 * A block representing a paragraph.
 *
 * @class CanvasEditor.RealtimeCanvas.UnorderedList
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  type: 'unordered-list',
  content: '',
  lastContent: ''
});
