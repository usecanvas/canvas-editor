import Block from './block';

/**
 * A block representing an image.
 *
 * @class CanvasEditor.RealtimeCanvas.Image
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'image'
});
