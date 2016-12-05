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
      const { lines, isInline } = JSON.parse(pasteData);
      if (isInline) return lines[0];
      return lines
        .map(cleanID)
        .map(json => RealtimeCanvas.createBlockFromJSON(json));
    } catch (err) {
      return null;
    }
  }
}

function cleanID(line) {
  if (line.blocks) {
    line.blocks = line.blocks.map(cleanID);
  }
  Reflect.deleteProperty(line, 'id');
  return line;
}

function extractPasteData({ originalEvent: { clipboardData } }) {
  const types = Array.from(clipboardData.types);
  if (types.includes('application/json')) {
    return clipboardData.getData('application/json');
  }
  return clipboardData.getData('text/plain');
}

function blocksToMarkdown(blocks) {
  return blocks.reduce(blockToMarkdown, '').replace(/\s+$/, '');
}

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

function buildHashes(block) {
  return '#'.repeat(block.get('meta.level'));
}

function buildSpaces(block) {
  return '  '.repeat(block.get('meta.level') - 1);
}
