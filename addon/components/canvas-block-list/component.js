import BlockComponent from 'canvas-editor/components/canvas-block/component';
import layout from './template';

/**
 * A component for rendering lists.
 *
 * @class CanvasEditor.CanvasBlockListComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default BlockComponent.extend({
  classNames: ['canvas-block-list'],
  tagName: 'ul',
  layout
});
