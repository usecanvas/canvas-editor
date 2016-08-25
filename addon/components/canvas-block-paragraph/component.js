import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentEditable from 'canvas-editor/mixins/content-editable';

/**
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentEditable, {
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block-paragraph']
});
