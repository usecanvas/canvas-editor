import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Ember from 'ember';
import Highlight from 'highlight';
import SelectionState from 'canvas-editor/lib/selection-state';
import styles from './styles';
import { parseSymbolDefinition } from 'canvas-editor/lib/symbol/parser';

const { computed, observer, on, run } = Ember;
const isFirefox = window.navigator.userAgent.includes('Firefox');

/**
 * A component representing a "code" type canvas block's content.
 *
 * @class CanvasEditor.CanvasBlockCodeContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  attributeBindings: ['spellcheck'],
  classNames: ['canvas-block-code-content'],
  localClassNames: ['canvas-block-code-content'],
  spellcheck: false,
  styles,
  tagName: 'code',
  usesMarkdown: false,

  selectionState: computed(function() {
    return new SelectionState(this.get('element'));
  }),

  highlight: on('didInsertElement',
             observer('block.content', 'block.meta.language', function() {
    if (isFirefox) return;
    run.scheduleOnce('afterRender', _ => {
      this.get('selectionState').capture();

      const content = this.get('block.content');
      const language = this.get('block.meta.language');

      let highlighted = {};
      try {
        highlighted = Highlight.highlight(language, content);
      } catch (_err) {
      }

      let html;
      if (highlighted.value) {
        html = highlighted.value.replace(
          /\n/g, '<br data-restore-skip="true">');
      } else {
        html = content
          .replace(/&/g, '&amp;')
          .replace(/>/g, '&gt;')
          .replace(/</g, '&lt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }

      this.$().html(html || '<br>');
      this.get('selectionState').restore();
    });
  })),

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
  },

  paste(evt) {
    if (this.get('block.isSelected')) return;
    evt.preventDefault();
    evt.stopPropagation();
    const text = evt.originalEvent.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }
});
