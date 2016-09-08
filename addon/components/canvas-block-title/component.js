import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Ember from 'ember';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a "title" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockTitleComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  attributeBindings: ['placeholder:data-placeholder'],
  classNames: ['canvas-block-title'],
  isEmpty: computed.not('block.content'),
  localClassNames: ['component'],
  localClassNameBindings: ['isEmpty'],
  styles,

  placeholder: computed('block.content', function() {
    return this.get('block.content') ? '' : 'Give me a name...';
  })
});
