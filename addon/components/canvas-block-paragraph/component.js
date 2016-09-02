import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import styles from './styles';

/**
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  localClassNames: 'canvas-block-paragraph',
  styles,

  setBlockContentFromInput(content, preventRerender = true) {
    if (/^-\s/.test(content)) {
      this.get('changeToType')('paragraph/unordered-list',
        this.get('block'), content);
    } else {
      this._super(content, preventRerender);
    }
  },

  changeToList(type, content) {

  }
});
