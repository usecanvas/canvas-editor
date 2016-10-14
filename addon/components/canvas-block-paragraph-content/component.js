import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Code from 'canvas-editor/lib/realtime-canvas/code';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import RunKitBlock from 'canvas-editor/lib/realtime-canvas/runkit';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import styles from './styles';

/**
 * A component representing a "paragraph" type canvas block's content.
 *
 * @class CanvasEditor.CanvasBlockParagraphContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['canvas-block-paragraph-content'],
  localClassNames: ['canvas-block-paragraph-content'],
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

  newBlockAtSplit() { // eslint-disable-line max-statements
    const { textBeforeSelection, textAfterSelection } =
      TextManipulation.getManipulation(this.get('element'));

    if (!textAfterSelection) {
      if (isHorizontalRule(textBeforeSelection)) {
        const horizontalRule = HorizontalRule.create();
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(horizontalRule);
        return;
      } else if (isRunKit(textBeforeSelection)) {
        const runkit = RunKitBlock.create();
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(runkit);
        return;
      } else if (isImageURL(textBeforeSelection)) {
        const image = Image.create({ meta: { url: textBeforeSelection } });
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(image);
        return;
      } else if (isURL(textBeforeSelection)) {
        const urlBlock = URLCard.create({ meta: { url: textBeforeSelection } });
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(urlBlock);
        return;
      } else if (isCode(textBeforeSelection)) {
        const [_, language] = isCode(textBeforeSelection);
        const code = Code.create({ meta: { language } });
        this.blockReplacedLocally(code, { focus: true });
        return;
      }
    }

    this._super(...arguments);
    return;
  }
});

function getNewType(content) {
  if (isUnorderedListItem(content)) {
    return 'unordered-list-item';
  } else if (isHeading(content)) {
    return 'heading';
  }

  return null;
}

function isUnorderedListItem(content) {
  return (/^-\s/).test(content);
}

function isCode(content) {
  return content.match(/^```(\S+)?$/);
}

function isHeading(text) {
  return (/^#{1,6}\s/).test(text);
}

function isHorizontalRule(text) {
  return (/^---/).test(text);
}

function isImageURL(text) {
  return (/^https?:\/\/\S*\.(?:gif|jpg|jpeg|png)(?:\?\S*)?$/i).test(text);
}

function isRunKit(text) {
  return (/^\/runkit/).test(text);
}

function isURL(text) {
  return (/^https?:\/\/.*$/).test(text);
}
