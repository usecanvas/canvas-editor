import CLItem from './checklist-item';
import Group from './group-block';
import ULItem from './unordered-list-item';
/**
 * A group representing a unordered-list.
 *
 * @class CanvasEditor.RealtimeCanvas.List
 * @extends CanvasEditor.RealtimeCanvas.GroupBlock
 */
export default Group.extend({
  type: 'list',

  init() {
    this.get('blocks').setEach('parent', this);
  }
}).reopenClass({
  pattern: /^( *)[-*+] (.*)$/,
  createItemFromMarkdown(content) {
    return CLItem.pattern.test(content) ? CLItem.createFromMarkdown(content)
      : ULItem.createFromMarkdown(content);
  },
  createFromMarkdown(content) {
    return this.create({ blocks: [this.createItemFromMarkdown(content)] });
  }
});
