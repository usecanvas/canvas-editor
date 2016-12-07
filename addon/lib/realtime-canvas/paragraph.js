import ContentBlock from './content-block';

/**
 * A block representing a paragraph.
 *
 * @class CanvasEditor.RealtimeCanvas.Paragraph
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'paragraph'
}).reopenClass({
  pattern: /^(.*)$/,
  createFromMarkdown(content) {
    return this.create({ content });
  }
});
