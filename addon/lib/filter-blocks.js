import searchMatch from 'canvas-editor/lib/search-match';

export default function filterBlocks(blocks, filterTerm) {
  if (!filterTerm) return blocks;

  const isFiltered = makeIsFiltered(blocks, filterTerm);

  return blocks.reduce(([filteredBlocks, state], block) => {
    return isFiltered(block) ? [filteredBlocks.concat(block), state]
      : [filteredBlocks, state];
  }, [[], { headerLevel: null }])[0];
}

function transformFilterTerm(filterTerm) {
  const typePred = (b, type) => b.get('type') === type;
  const isPred = (b, key) => b.get(`meta.${key}`) === true;
  const notPred = (b, key) => !b.get(`meta.${key}`);
  const wrapPred = (fn, arg) => b => fn(b, arg);
  const res = filterTerm.split(/ +/).reduce((prev, next) => {
    if (next.startsWith('is:')) {
      prev.listMetaMatchers =
        prev.listMetaMatchers.concat(wrapPred(isPred, next.slice(3)));
    } else if (next.startsWith('not:')) {
      prev.listMetaMatchers =
        prev.listMetaMatchers.concat(wrapPred(notPred, next.slice(4)));
    } else if (next.startsWith('type:')) {
      prev.filters = prev.filters.concat(wrapPred(typePred, next.slice(5)));
    } else {
      prev.content = prev.content.concat(` ${next}`);
    }
    return prev;
  }, { content: '', filters: [], listMetaMatchers: [] });
  res.content = res.content.trim();
  return res;
}

function makeIsFiltered(blocks, filterTerm) {
  const filterQuery = transformFilterTerm(filterTerm);
  return function _isFiltered(block) {
    const correctType = filterQuery.filters.length === 0 ||
      filterQuery.filters.any(fn => fn(block));
    const correctMeta = filterQuery.listMetaMatchers.length === 0 ||
      filterQuery.listMetaMatchers.any(fn => fn(block));
    switch (block.get('type')) {
      case 'heading':
        return correctType && filterHeading(block, filterQuery.content, blocks);
      case 'horizontal-rule':
        return true;
      case 'list':
        return filterBlocks(block.get('blocks'), filterTerm).length > 0;
      case 'title':
        return true;
      case 'url':
        return correctType && filterURL(block, filterQuery.content);
      case 'checklist-item':
        return correctType && correctMeta &&
        searchMatch(block.get('content'), filterQuery.content);
      default:
        return correctType &&
        searchMatch(block.get('content'), filterQuery.content);
    }
  };
}

function filterHeading(block, filterTerm, blocks) {
  const index = blocks.indexOf(block);
  const searchBlocks = blocks.slice(index + 1);

  if (searchMatch(block.get('content'), filterTerm)) return true;

  for (const searchBlock of searchBlocks) {
    if (searchBlock.get('type') === 'heading' &&
        searchBlock.get('meta.level') <= block.get('meta.level')) {
      return false;
    }

    if (searchBlock.get('type') === 'horizontal-rule') continue;
    if (filterBlocks([searchBlock], filterTerm).length > 0) return true;
  }

  return false;
}

function filterURL(block, filterTerm) {
  return [
    block.get('meta.url'),
    block.get('unfurled.title'),
    block.get('unfurled.text')
  ].any(value => searchMatch(value, filterTerm));
}
