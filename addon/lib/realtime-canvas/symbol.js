import Block from './block';

/**
 * A block representing an symbol.
 *
 * @class CanvasEditor.RealtimeCanvas.Symbol
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'symbol'
});
