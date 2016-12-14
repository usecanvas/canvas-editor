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

  onSwapBlockDown: Ember.K,
  onSwapBlockUp: Ember.K,

  placeholder: computed('block.meta.placeholder', function() {
    return this.getWithDefault('block.meta.placeholder', 'Give me a title...');
  }),

  keyDown(evt) {
    if (this.get('showTemplates') && this.get('filteredTemplates.length') > 0) {
      switch (evt.keyCode) {
        case 38:
        case 40:
          // Up & Down offsets are turned into -1 & 1 respectively
          this.get('navigateAutocomplete')(evt.keyCode - 39);
          evt.preventDefault();
          break;
        case 27:
          this.get('onAutocompleteEscape')([]);
          evt.preventDefault();
          evt.stopPropagation();
          break;
        case 13:
          this.get('selectTemplateByIndex')();
          evt.preventDefault();
          break;
        default:
          this._super(...arguments);
      }
    } else {
      this._super(...arguments);
    }
  }
});
