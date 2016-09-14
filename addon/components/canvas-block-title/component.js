import CanvasBlockContent from 'canvas-editor/components/canvas-block-content/component';
import Ember from 'ember';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a "title" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockTitleComponent
 * @extends CanvasEditor.CanvasBlockContentComponent
 */
export default CanvasBlockContent.extend({
  classNames: ['canvas-block-title'],
  localClassNames: ['component'],
  styles,

  placeholder: computed('block.meta.placeholder', function() {
    return this.getWithDefault('block.meta.placeholder', 'Give me a title...');
  })
});
