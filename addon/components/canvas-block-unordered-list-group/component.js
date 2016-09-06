import BlockComponent from 'canvas-editor/components/canvas-block/component';
import layout from './template';

/**
 * A component for rendering unordered list groups.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListGroupComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default BlockComponent.extend({
  classNames: ['canvas-block-unordered-list-group'],
  tagName: 'ul',
  layout
});
