import RealtimeCanvas from './realtime-canvas';

/**
 * Class for extracting pasted RealtimeCanvas blocks from a `paste` event.
 *
 * @class CopyPaste
 */
export default class CopyPaste {
  constructor(evt) {
    this.pasteData = extractPasteData(evt);
  }

  /**
   * @member {?Array<CanvasEditor.RealtimeCanvas.Block>} Blocks extracted from a
   *   `paste` event
   */
  get pastedLines() {
    try {
      const { lines, isInline } = JSON.parse(this.pasteData);

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
  const { types } = clipboardData;

  if (types.includes('application/x-canvas')) {
    return clipboardData.getData('application/x-canvas');
  }

  return clipboardData.getData('text/plain');
}
