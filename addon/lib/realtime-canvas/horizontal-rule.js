import Block from './block';

/**
 * A block representing a tip.
 *
 * @class CanvasEditor.RealtimeCanvas.HorizontalRule
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'horizontal-rule'
});
