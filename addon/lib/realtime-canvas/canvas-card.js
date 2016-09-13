import Block from './block';

/**
 * A block representing a canvas.
 *
 * @class CanvasEditor.RealtimeCanvas.Canvas
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'canvas'
});
