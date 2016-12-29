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

function isContinuableList(first, rest) {
  return (/[ \t]*\+ /).test(first) && rest.length > 0;
}

function isEmptyBlock({ type, content }) {
  return type === 'paragraph' && content === '';
}

function isPlaceholderBlock(parseList) {
  return parseList.length === 1 && typeof parseList[0] !== 'string';
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
      rest.length === 0) return block.toJSON();
  if (isPlaceholderBlock([first, ...rest])) return parsePlaceholderBlock(first);
  if (block.get('type') === 'list') {
    return parseListPlaceholderBlock(block, text);
  }
  return parseMultiPlaceholderBlock(block);
}

function parseListPlaceholderBlock(block, text) {
  const lineParser = buildParser(/(<[^:]*[^: \t]+[^:]*:[^>]+>)/, LineReducer);
  const { type, meta, content } = block.get('blocks.0').toJSON();
  const [first, ...rest] = lineParser(text);
  const isContinuable = isContinuableList(first, rest);
  const cBlocks = lineParser(content);
  const isPlaceholderBlock = isPlaceholderBlock(cBlocks);
  if (isPlaceholderBlock) {
    return { isPlaceholderBlock, type, meta, isContinuable,
      content: '', key: cBlocks[0].key, placeholder: cBlocks[0].val };
  }
  return { type, meta, isContinuable, blocks: cBlocks };
}

function parseMultiPlaceholderBlock(block) {
  const lineParser = buildParser(/(<[^:]*[^: \t]+[^:]*:[^>]+>)/, LineReducer);
  const { type, meta, content } = block.toJSON();
  return { type, meta, blocks: lineParser(content) };
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
