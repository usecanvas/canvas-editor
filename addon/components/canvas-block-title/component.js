import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import layout from './template';

const { computed } = Ember;

/**
 * A component representing a "title" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockTitleComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-title'],
  layout,
  localClassNames: ['component']
});
