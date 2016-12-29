import RealtimeCanvas from '../realtime-canvas';
import Image from '../realtime-canvas/image';
import URL from '../realtime-canvas/url-card';

const LineReducer = {
  placeholder(acc, text) {
    const [key, ...vals] = text.slice(1, -1).split(':');
    return ['initial',
      acc.concat({ key: key.trim(), placeholder: vals.join(':').trim() })];
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
      rest.length === 0) return JSON.parse(JSON.stringify(block));
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
  if (isPlaceholderBlock(cBlocks)) {
    meta.placeholder = cBlocks[0].placeholder;
    return { isPlaceholder: true, type, meta,  isContinuable,
      content: '', key: cBlocks[0].key, placeholder: cBlocks[0].placeholder };
  }
  return { isMultiPlaceholder: true, type, meta, isContinuable,
    blocks: cBlocks };
}

function parseMultiPlaceholderBlock(block) {
  const lineParser = buildParser(/(<[^:]*[^: \t]+[^:]*:[^>]+>)/, LineReducer);
  const { type, meta, content } = block.toJSON();
  return { isMultiPlaceholder: true, type, meta, blocks: lineParser(content) };
}

function parsePlaceholderBlock({ key, placeholder }) {
  if (Image.pattern.test(placeholder)) {
    return { isPlaceholder: true, type: 'image', key, placeholder };
  } else if (URL.pattern.test(placeholder)) {
    return { isPlaceholder: true, type: 'url', key, placeholder };
  }
  return { isPlaceholder: true, type: 'paragraph', key, placeholder,
    meta: { placeholder } };
}

export function parseSymbolDefinition(defn) {
  return buildParser(/\r?\n/, ParseReducer)(defn)
    .map(json => RealtimeCanvas.createBlockFromJSON(json));
}
