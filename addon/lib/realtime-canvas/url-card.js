import Block from './block';

/**
 * A block representing a paragraph.
 *
 * @class CanvasEditor.RealtimeCanvas.Paragraph
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  type: 'url',
  content: null,
  lastContent: null
});
