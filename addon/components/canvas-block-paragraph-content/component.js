import CanvasBlockEditable from 'canvas-editor/components/canvas-block-editable/component';
import CanvasCard from 'canvas-editor/lib/realtime-canvas/canvas-card';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import RunKitBlock from 'canvas-editor/lib/realtime-canvas/runkit';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import styles from './styles';

/* eslint-disable max-len */
const CANVAS_URL = new RegExp(
  `^https?:\/\/(?:www\.)?${window.location.host}\/[^\/]+\/([^\/]{22})$`);
/* eslint-enable max-len */

/**
 * A component representing a "paragraph" type canvas block's content.
 *
 * @class CanvasEditor.CanvasBlockParagraphContentComponent
 * @extends CanvasEditor.CanvasBlockEditableComponent
 */
export default CanvasBlockEditable.extend({
  classNames: ['canvas-block-paragraph-content'],
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

    if (!textAfterSelection) {
      if (isCanvasURL(textBeforeSelection)) {
        const canvasBlock =
          CanvasCard.create({ meta: parseCanvasURL(textBeforeSelection) });
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(canvasBlock);
        return;
      } else if (isHorizontalRule(textBeforeSelection)) {
        const horizontalRule = HorizontalRule.create();
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(horizontalRule);
        return;
      } else if (isRunKit(textBeforeSelection)) {
        const runkit = RunKitBlock.create();
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(runkit);
        return;
      } else if (isURL(textBeforeSelection)) {
        const urlBlock = URLCard.create({ meta: { url: textBeforeSelection } });
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(urlBlock);
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

function isCanvasURL(text) {
  return CANVAS_URL.test(text);
}

function isHeading(text) {
  return (/^#{1,6}\s/).test(text);
}

function isHorizontalRule(text) {
  return (/^---/).test(text);
}

function isRunKit(text) {
  return (/^\/runkit/).test(text);
}

function isURL(text) {
  return (/^https?:\/\/.*$/).test(text);
}

function parseCanvasURL(url) {
  return { id: url.match(CANVAS_URL)[1] };
}
