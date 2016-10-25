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
    run.scheduleOnce('afterRender', _ => {
      this.get('selectionState').capture();

      const content = this.get('block.content');
      const language = this.get('block.meta.language');

      let highlighted;
      try {
        highlighted = Highlight.highlight(language, content);
      } catch (_err) {
        highlighted = { value: content };
      }

      this.$().html(highlighted.value || '<br>');
      this.get('selectionState').restore();
    });
  })),

  keyDown(evt) {
    switch (evt.originalEvent.key || evt.originalEvent.keyCode) {
    case 'Enter':
    case 13:
      evt.stopPropagation();
      evt.preventDefault();

      if (evt.metaKey) {
        this.newBlockAtSplit();
      } else {
        this.get('selectionState').capture();
        this.get('selectionState').offset(1);
        document.execCommand('insertText', null, '\n');
        this.get('selectionState').restore();
      }

      break;
    default:
      this._super(...arguments);
      return;
    }
  }
});
