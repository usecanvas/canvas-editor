import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import styles from './styles';

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
  },

  newBlockAtSplit() {
    const { textBeforeSelection, textAfterSelection } =
      TextManipulation.getManipulation(this.get('element'));

    if (!textBeforeSelection ||
        textAfterSelection ||
        !isURL(textBeforeSelection)) {
      this._super(...arguments);
      return;
    }

    const urlBlock = URLCard.create({ meta: { url: textBeforeSelection } });

    this.newBlockInsertedLocally('');
    this.blockReplacedLocally(urlBlock);
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

function isURL(text) {
  return (/^https?:\/\/.*$/).test(text);
}
