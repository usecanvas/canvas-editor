import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Ember from 'ember';
import Highlight from 'highlight';
import SelectionState from 'canvas-editor/lib/selection-state';
import styles from './styles';

const { computed, observer, on, run } = Ember;

/**
 * A component representing a "code" type canvas block's content.
 *
 * @class CanvasEditor.CanvasBlockCodeContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  attributeBindings: ['spellcheck:spellcheck'],
  classNames: ['canvas-block-code-content'],
  localClassNames: ['component'],
  spellcheck: 'false',
  styles,
  tagName: 'code',

  selectionState: computed(function() {
    return new SelectionState(this.get('element'));
  }),

  highlight: on('didInsertElement',
             observer('block.content', 'block.meta.language', function() {
    run.scheduleOnce('afterRender', _ => {
      this.get('selectionState').capture();

      const content = this.get('block.content');
      const language = this.get('block.meta.language');

      let html;
      try {
        html = Highlight.highlight(language, content);
      } catch (_err) {
        html = Highlight.highlightAuto(content);
      }

      this.$().html(html.value || '<br>');
      this.get('selectionState').restore();
    });
  }),

  keyDown(evt) {
    switch (evt.originalEvent.key || evt.originalEvent.keyCode) {
    case 'Enter':
    case 13:
      if (!evt.shiftKey) return;
      evt.stopPropagation();
      evt.preventDefault();
      this.newBlockAtSplit();
      break;
    default:
      this._super(...arguments);
      return;
    }
  }
});
