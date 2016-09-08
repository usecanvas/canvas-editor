import ContentBlock from './content-block';
import Ember from 'ember';

const { computed } = Ember;

/**
 * A block representing a checklist item.
 *
 * @class CanvasEditor.RealtimeCanvas.ChecklistItem
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'checklist-item',
  meta: computed(_ => Ember.Object.create({ checked: false }))
}).reopenClass({
  createFromMarkdown(markdown, properties) {
    if (!markdown.startsWith('- ')) markdown = `- ${markdown}`;
    const checked = (/^- \[[Xx]/).test(markdown);
    const content = markdown.split(/^- \[.\] /)[1] || '';

    return this.create(Object.assign(properties, {
      content,
      meta: { checked }
    }));
  }
});
