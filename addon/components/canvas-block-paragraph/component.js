import CanvasBlockContent from 'canvas-editor/components/canvas-block-content/component';
import TextManipulation from 'canvas-editor/lib/text-manipulation';
import RunKitBlock from 'canvas-editor/lib/realtime-canvas/runkit';
import CanvasCard from 'canvas-editor/lib/realtime-canvas/canvas-card';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';
import styles from './styles';

/* eslint-disable max-len */
const CANVAS_URL = new RegExp(
  `^https?:\/\/(?:www\.)?${window.location.host}\/[^\/]+\/[^\/]+\/([^\/]{22})(?:\/next)?$`);
/* eslint-enable max-len */

/**
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends CanvasEditor.CanvasBlockContentComponent
 */
export default CanvasBlockContent.extend({
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

    if (!textAfterSelection) {
      if (isCanvasURL(textBeforeSelection)) {
        const canvasBlock =
          CanvasCard.create({ meta: parseCanvasURL(textBeforeSelection) });
        this.newBlockInsertedLocally('');
        this.blockReplacedLocally(canvasBlock);
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
  }

  return null;
}

function isUnorderedListItem(content) {
  return (/^-\s/).test(content);
}

function isCanvasURL(text) {
  return CANVAS_URL.test(text);
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
