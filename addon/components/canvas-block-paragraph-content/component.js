import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import Code from 'canvas-editor/lib/realtime-canvas/code';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import RunKitBlock from 'canvas-editor/lib/realtime-canvas/runkit';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import Tip from 'canvas-editor/lib/realtime-canvas/tip';
import SymbolBlock from 'canvas-editor/lib/realtime-canvas/symbol';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import { parseSymbolCommand } from 'canvas-editor/lib/symbol/parser';
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
      } else if (isSymbolDefn(textBeforeSelection)) {
        const [_, symbolName] = isSymbolDefn(textBeforeSelection);
        const code = Code.create({ meta: { language: 'symbol', symbolName } });
        this.blockReplacedLocally(code, { focus: true });
        return;
      } else if (isCode(textBeforeSelection)) {
        const [_, language] = isCode(textBeforeSelection);
        const code = Code.create({ meta: { language } });
        this.blockReplacedLocally(code, { focus: true });
        return;
      } else if (this.get('isTemplate') && isTip(textBeforeSelection)) {
        const tip = Tip.create();
        this.blockReplacedLocally(tip, { focus: true });
        return;
      } else if (isSymbol(textBeforeSelection)) {
        const meta = parseSymbolCommand(textBeforeSelection);
        const symbol = SymbolBlock.create({ meta });
        this.blockReplacedLocally(symbol);
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
  return (/^[-*+]\s/).test(content);
}

function isCode(content) {
  return content.match(/^```(\S+)?$/);
}

function isSymbolDefn(content) {
  return content.match(/^```symbol=(\S+)?$/);
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

function isSymbol(text) {
  return (/^\/symbol/).test(text);
}

function isTip(text) {
  return (/^\/protip$/).test(text);
}

function isURL(text) {
  return (/^https?:\/\/.*$/).test(text);
}
