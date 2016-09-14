import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import layout from './template';

/*
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-paragraph'],
  layout
});
