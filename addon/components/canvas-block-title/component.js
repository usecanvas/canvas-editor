import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

/**
 * A component representing a "title" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockTitleComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend({
  classNames: ['canvas-block-title'],
  layout,
  localClassNames: ['component'],
  styles
});
