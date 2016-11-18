import Block from './block';

/**
 * A single block with content in a canvas.
 *
 * @class CanvasEditor.RealtimeCanvas.ContentBlock
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: '',
  lastContent: ''
});
