import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['canvas-block-paragraph'],
  localClassNames: ['component'],
  styles,

  setBlockContentFromInput(content, preventRerender = true) {
    const type = getNewType(content);

    if (type) {
      this.get('changeBlockType')(
        `paragraph/${type}`, this.get('block'), content);
    } else {
      this._super(content, preventRerender);
    }
  }
});

function getNewType(content) {
  if (isUnorderedListItem(content)) {
    return 'unordered-list-item';
  }

  return null;
}

function isUnorderedListItem(content) {
  return (/^-\s/).test(content);
}
