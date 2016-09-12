import Block from './block';

/**
 * A block representing a canvas.
 *
 * @class CanvasEditor.RealtimeCanvas.Canvas
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  type: 'canvas',
  content: null,
  lastContent: null
});
