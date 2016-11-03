import Block from './block';

/**
 * A block representing an upload.
 *
 * @class CanvasEditor.RealtimeCanvas.Upload
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'upload'
});
