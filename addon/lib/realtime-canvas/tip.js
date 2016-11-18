import Block from './block';

/**
 * A block representing a tip.
 *
 * @class CanvasEditor.RealtimeCanvas.Tip
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: '',
  isCard: true,
  isEditableCard: true,
  lastContent: '',
  type: 'tip'
});
