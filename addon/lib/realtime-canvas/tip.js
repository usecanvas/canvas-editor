import Block from './block';

/**
 * A block representing a tip.
 *
 * @class CanvasEditor.RealtimeCanvas.Tip
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  type: 'tip',
  content: null,
  lastContent: null
});
