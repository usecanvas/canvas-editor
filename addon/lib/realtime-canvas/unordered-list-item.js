import ContentBlock from './content-block';

/**
 * A block representing a paragraph.
 *
 * @class CanvasEditor.RealtimeCanvas.UnorderedListItem
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'unordered-list-item'
}).reopenClass({
  createFromMarkdown(markdown, properties) {
    const content = markdown.split(/^- /)[1] || '';
    return this.create(Object.assign(properties, { content }));
  }
});
