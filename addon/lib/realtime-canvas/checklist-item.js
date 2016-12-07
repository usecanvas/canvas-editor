import ContentBlock from './content-block';
import Ember from 'ember';

const { computed, getWithDefault } = Ember;

/**
 * A block representing a checklist item.
 *
 * @class CanvasEditor.RealtimeCanvas.ChecklistItem
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'checklist-item',
  meta: computed(_ => Ember.Object.create({ level: 1, checked: false }))
}).reopenClass({
  pattern: /^( *)[-*+] \[[x ]\] (.*)$/,
  createFromMarkdown(markdown, properties) {
    const checked = (/^([ ]{0,6})[-*+] \[[Xx]/).test(markdown);
    const [_, spaces, content] = markdown.match(this.pattern);
    const level = properties ? getWithDefault(properties, 'meta.level', 1)
      : Math.min(4, Math.floor(spaces.length / 2) + 1);

    return this.create(Object.assign(properties || {}, {
      content,
      meta: { checked, level }
    }));
  }
});
