import List from './realtime-canvas/list';
import RealtimeCanvas from './realtime-canvas';

/**
 * Class for extracting pasted RealtimeCanvas blocks from a `paste` event and
 * writing RealtimeCanvas blocks to the clipboard for a `copy` event.
 *
 * @class CopyPaste
 */
export default class CopyPaste {
  constructor(evt) {
    this.evt = evt;
  }

  /**
   * Writes a list of block into the clipboard in various formats.
   *
   * @method
   * @param {Array<CanvasEditor.CanvasRealtime.Block>} blocks The blocks to
   * write
   * to the clipboard
   */
  copyBlocksToClipboard(blocks) {
    const { originalEvent: { clipboardData } } = this.evt;
    clipboardData.setData('application/json',
      JSON.stringify({ lines: blocks }));
    clipboardData.setData('text/plain', blocksToMarkdown(blocks));
    clipboardData.setData('text/rich', blocksToMarkdown(blocks));
    this.evt.preventDefault();
  }

  /**
   * @member {?Array<CanvasEditor.RealtimeCanvas.Block>} Blocks extracted from a
   *   `paste` event
   */
  get pastedLines() {
    try {
      const pasteData = extractPasteData(this.evt);
      if (pasteData.lines) {
        return pasteData.lines
          .map(cleanID)
          .map(json => RealtimeCanvas.createBlockFromJSON(json));
      }
      return markdownToBlocks(pasteData);
    } catch (err) {
      return null;
    }
  }
}

/**
 * Removes the id key from a block and its children
 *
 * @function
 * @param {Object} block The block to clean
 * @returns {Object} The cleaned block
 */
function cleanID(block) {
  if (block.blocks) {
    block.blocks = block.blocks.map(cleanID);
  }
  Reflect.deleteProperty(block, 'id');
  return block;
}

/**
 * Takes the paste event and extracts the correct formatted data to paste.
 *
 * @function
 * @param {DataTransfer} clipboardData The clipboard for the paste event
 * @returns {String} The correct formatted data contained in the clipboard.
 */
function extractPasteData({ originalEvent: { clipboardData } }) {
  const types = Array.from(clipboardData.types);
  if (types.includes('application/json')) {
    return JSON.parse(clipboardData.getData('application/json'));
  }
  return clipboardData.getData('text/plain');
}

/**
 * Takes a list of blocks and returns the markdown representation of it.
 *
 * @function
 * @param {Array<CanvasEditor.CanvasRealtime.Block>} blocks The blocks to
 * convert
 * @returns {String} The markdown representation of the blocks
 */
function blocksToMarkdown(blocks) {
  return blocks.reduce(blockToMarkdown, '').replace(/\s+$/, '');
}

const ParseReducer = {
  code(acc, nextLine) {
    if (isCodeFence(nextLine)) return [acc, 'create'];
    const prevBlock = acc[acc.length - 1];
    const newContent = prevBlock.get('content') === ''
      ? nextLine : `${prevBlock.get('content')}\n${nextLine}`;
    prevBlock.set('content', newContent);
    return [acc, 'code'];
  },

  continuation(acc, nextLine) {
    const prevBlock = acc[acc.length - 1];
    const isNewLine = nextLine === '';
    if (isNewLine) return [acc, 'create'];
    if (prevBlock.get('isGroup') && List.pattern.test(nextLine)) {
      const item = List.createItemFromMarkdown(nextLine);
      item.set('parent', prevBlock);
      prevBlock.get('blocks').pushObject(item);
    } else {
      const newContent = `${prevBlock.get('content')}\n${nextLine}`;
      prevBlock.set('content', newContent);
    }
    return [acc, 'continuation'];
  },

  create(acc, nextLine) {
    const isNewLine = nextLine === '';
    if (isNewLine) { return [acc, 'create'];  }
    const nextBlock = RealtimeCanvas.createBlockFromMarkdown(nextLine);
    acc.pushObject(nextBlock);
    if (nextBlock.get('type') === 'code') return [acc, 'code'];
    const canContinue = !nextBlock.get('isCard') &&
      nextBlock.get('type') !== 'heading';
    return canContinue ?  [acc, 'continuation'] : [acc, 'create'];
  }
};

/**
 * Takes markdown text and returns the corresponding blocks.
 *
 * @function
 * @param {String} markdown The markdown text to convert
 * convert
 * @returns {Array<CanvasEditor.CanvasRealtime.Block>} The converted blocks
 */
function markdownToBlocks(markdown) {
  return markdown.split(/\r?\n/).reduce(([acc, parseState], nextLine) => {
    return ParseReducer[parseState](acc, nextLine);
  }, [[], 'create'])[0];
}

function isCodeFence(line) { return (/^```/).test(line); }
/**
 * Generates the markdown representation of a block and appends it
 * to the accumulated string.
 *
 * @function
 * @param {String} acc The accumulated string
 * @param {CanvasEditor.CanvasRealtime.Block} block The block to convert
 * @returns {String} The markdown representation of the block and the blocks
 * prior
 */
function blockToMarkdown(acc, block) {
  /* eslint-disable no-case-declarations */
  switch (block.get('type')) {
    case 'title': return `# ${block.get('content')}\n\n`;
    case 'paragraph': return `${acc}${block.get('content')}\n\n`;
    case 'horizontal-rule': return `${acc}---\n\n`;
    case 'heading':
      return `${acc}${buildHashes(block)} ${block.get('content')}\n\n`;
    case 'url': return `${acc}${encodeURI(block.get('meta.url'))}\n\n`;
    case 'image': return `${acc}![](${encodeURI(block.get('meta.url'))})\n\n`;
    case 'code':
      const fence = '```';
      const { content, meta } = block.getProperties('content', 'meta');
      return `${acc}${fence}${meta.language}\n${content}\n${fence}\n\n`;
    case 'list': return `${acc}${blocksToMarkdown(block.get('blocks'))}\n\n`;
    case 'unordered-list-item':
      return `${acc}${buildSpaces(block)}- ${block.get('content')}\n`;
    case 'checklist-item':
      const box = block.get('meta.checked') ? '[x]' : '[ ]';
      return `${acc}${buildSpaces(block)}- ${box} ${block.get('content')}\n`;
    default: return acc;
  }
}

/**
 * Generate appropriate hashes based on the  block's level
 *
 * @function
 * @param {Object} block The block to analyze
 * @returns {String} The hashes to prefix the block's content
 */
function buildHashes(block) {
  return '#'.repeat(block.get('meta.level'));
}

/**
 * Generate appropriate spaces based on the block's level
 *
 * @function
 * @param {Object} block The block to analyze
 * @returns {String} The spaces to prefix the block's content
 */
function buildSpaces(block) {
  return '  '.repeat(block.get('meta.level') - 1);
}
