import Block from './block';

/**
 * A block representing a paragraph.
 *
 * @class CanvasEditor.RealtimeCanvas.Paragraph
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'url'
});
