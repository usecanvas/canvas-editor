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
}).reopenClass({
  pattern: /^!\[\]\(https?:\/\/\S*\.(?:gif|jpg|jpeg|png)(?:\?\S*)?\)$/i,
  createFromMarkdown(source) {
    const url = source.slice(4, -1);
    return this.create({ meta: { url } });
  }
});
