import RealtimeCanvas from '../realtime-canvas';
import Image from '../realtime-canvas/image';
import URL from '../realtime-canvas/url-card';

const LineReducer = {
  placeholder(acc, text) {
    const [key, val] = text.slice(1, -1).split(':');
    return ['initial', acc.concat({ key, val: val.trim() })];
  },

  initial(acc, text) {
    if (text !== '') {
      return ['placeholder', acc.concat(text)];
    }
    return ['placeholder', acc];
  }
};

const ParseReducer = {
  initial(acc, text) {
    const lineParser = buildParser(/(<[^:]*[^: \t]+[^:]*:[^>]+>)/, LineReducer);
    const parsed = lineParser(text);
    return ['initial', acc.concat(text)];
  }
};

function buildParser(regex, reducer) {
  return text => text.split(regex).reduce(([parseState, acc], next) =>
    reducer[parseState](acc, next)
  , ['initial', []])[1];
}

function parseBlock(text) {
  const lineParser = buildParser(/(<[^:]*[^: \t]+[^:]*:[^>]+>)/, LineReducer);
  const [first, ...rest] = lineParser(text);
  if (typeof first === 'string' &&
      rest.length === 0) return RealtimeCanvas.createBlockFromMarkdown(text);
  if (rest.length === 0) return true;
}

function isContinuableList(first, rest) {
  return /[ \t]*\* /.test(first);
}

function parsePlaceholder({ key, val }) {
  if (Image.pattern.test(val)) {
    return PlaceholderImage.create({ key, placeholder: val });
  } else if (URL.pattern.test(val)) {
    return PlaceholderURL.create({ key, placeholder: val });
  } else {
    return PlaceholderParagraph.create({ key, placeholder: val });
  }
}


export function parseSymbolDefinition(defn) {
  return buildParser(/\r?\n/, ParseReducer)(defn);
}
