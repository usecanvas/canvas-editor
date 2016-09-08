import Group from './group-block';
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
});
