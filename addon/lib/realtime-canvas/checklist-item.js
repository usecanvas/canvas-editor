import Block from './content-block';

/**
 * A block representing a checklist item.
 *
 * @class CanvasEditor.RealtimeCanvas.ChecklistItem
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  type: 'checklist-item'
}).reopenClass({
  createFromMarkdown(markdown, properties) {
    if (!markdown.startsWith('- ')) markdown = `- ${markdown}`;
    const checked = (/^- \[[Xx]/).test(markdown);
    const content = markdown.split(/^- \[.\] /)[1];

    return this.create(Object.assign(properties, {
      content,
      meta: { checked }
    }));
  }
});
