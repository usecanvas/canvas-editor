import Block from './block';

/**
 * A block representing an unknown type.
 *
 * @class CanvasEditor.RealtimeCanvas.Unknown
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'unknown'
});
