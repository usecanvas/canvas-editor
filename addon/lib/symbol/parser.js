import RealtimeCanvas from '../realtime-canvas';
import Image from '../realtime-canvas/image';
import URL from '../realtime-canvas/url-card';

const LineReducer = {
  placeholder(acc, text) {
    const [key, ...vals] = text.slice(1, -1).split(':');
    return ['initial',
      acc.concat({ key: key.trim(), val: vals.join(':').trim() })];
  },

  initial(acc, text) {
    if (text !== '') {
      return ['placeholder', acc.concat(text)];
    }
    return ['placeholder', acc];
  }
};

const ParseReducer = {
  code(acc, text) {
    const lastBlock = acc[acc.length - 1];
    const block = parseBlock(text);
    if (block.type === 'code') {
      return ['initial', acc];
    }
    lastBlock.blocks = (lastBlock.blocks || []).concat(block);
    return ['code', acc];
  },

  initial(acc, text) {
    const block = parseBlock(text);
    if (block.type === 'code') {
      return ['code', acc.concat(block)];
    } else if (isEmptyBlock(block)) {
      return ['initial', acc];
    }
    return ['initial', acc.concat(block)];
  }
};

function isEmptyBlock({ type, content }) {
  return type === 'paragraph' && content === '';
}

function buildParser(regex, reducer) {
  return text => text.split(regex).reduce(([parseState, acc], next) =>
    reducer[parseState](acc, next)
  , ['initial', []])[1];
}

function parseBlock(text) {
  const block = RealtimeCanvas.createBlockFromMarkdown(text);
  const lineParser = buildParser(/(<[^:]*[^: \t]+[^:]*:[^>]+>)/, LineReducer);
  const [first, ...rest] = lineParser(text);
  if (!first || typeof first === 'string' &&
      rest.length === 0) return RealtimeCanvas.createBlockFromMarkdown(text)
    .toJSON();
  if (rest.length === 0) return parsePlaceholderBlock(first);
  if (block.get('type') === 'list') {
    const { type, meta, content } = block.get('blocks.0').toJSON();
    const isContinuable = isContinuableList(first, rest);
    return { type, meta, isContinuable, blocks: lineParser(content) };
  }
  const { type, meta, content } = block.toJSON();
  return { type, meta, blocks: lineParser(content) };
}

function isContinuableList(first, rest) {
  return (/[ \t]*\+ /).test(first) && rest.length > 0;
}

function parsePlaceholderBlock({ key, val }) {
  if (Image.pattern.test(val)) {
    return { type: 'placeholder-image', key, placeholder: val };
  } else if (URL.pattern.test(val)) {
    return { type: 'placeholder-url', key, placeholder: val };
  }
  return { type: 'placeholder-paragraph', key, placeholder: val };
}


export function parseSymbolDefinition(defn) {
  return buildParser(/\r?\n/, ParseReducer)(defn);
}
