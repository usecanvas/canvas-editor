import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Ember from 'ember';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a "title" type canvas block's content.
 *
 * @class CanvasEditor.CanvasBlockTitleContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['canvas-block-title-content'],
  localClassNames: ['canvas-block-title-content'],
  styles,

  placeholder: computed('block.meta.placeholder', function() {
    return this.getWithDefault('block.meta.placeholder', 'Give me a title...');
  }),

  keyDown(evt) {
      console.log(evt.keyCode, ':', this.get('showTemplates'));
    if (this.get('showTemplates')) {
      console.log(evt.keyCode);

    }
    this._super(...arguments);
  }
});
