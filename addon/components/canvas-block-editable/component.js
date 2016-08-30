import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentEditable from 'canvas-editor/mixins/content-editable';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';

/**
 * A component representing a user-editable canvas block.
 *
 * @class CanvasEditor.CanvasBlockEditableComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentEditable, {
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block-editable'],
  nextBlockConstructor: Paragraph
});
