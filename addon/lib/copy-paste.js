import RealtimeCanvas from './realtime-canvas';

function cleanID(line) {
  if (line.blocks) {
    line.blocks = line.blocks.map(cleanID);
  }
  Reflect.deleteProperty(line, 'id');
  return line;
}

function extractPasteData({ originalEvent: { clipboardData } }) {
  const { types } = clipboardData;
  if (types.contains('application/x-canvas')) {
    return clipboardData.getData('application/x-canvas');
  }
  return clipboardData.getData('text/plain');
}

export default class CopyPaste {
  constructor(evt) {
    this._evt = evt;
    this.pasteData = extractPasteData(evt);
  }

  get pastedLines() {
    try {
      const { lines, isInline } = JSON.parse(this.pasteData);
      if (isInline) return lines[0];
      return lines.map(cleanID).map(RealtimeCanvas.createBlockFromJSON.bind(RealtimeCanvas));
    } catch (err) {
      return null;
    }
  }
}
