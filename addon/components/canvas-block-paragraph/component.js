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
    if (/^- /.test(content)) {
      const block = this.get('block');
      block.set('lastType', 'paragraph');
      block.set('type', 'unordered-list');
      block.set('lastContent', block.get('content'));
      block.set('content', content.slice(2));
      this.get('onBlockContentUpdatedLocally')(this.get('block'));
      this.get('onBlockTypeUpdatedLocally')(this.get('block'));
    } else {
      this._super(content, preventRerender);
    }
  },

  changeToList(type, content) {

  }
});
