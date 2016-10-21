import searchMatch from 'canvas-editor/lib/search-match';

export default function filterBlocks(blocks, filterTerm) {
  if (!filterTerm) return blocks;

  const isFiltered = makeIsFiltered(blocks, filterTerm);

  return blocks.reduce(([filteredBlocks, state], block) => {
    if (isFiltered(block)) return [filteredBlocks.concat(block), state];
    return [filteredBlocks, state];
  }, [[], { headerLevel: null }])[0];
}

function makeIsFiltered(blocks, filterTerm) {
  return function _isFiltered(block) {
    switch (block.get('type')) {
      case 'heading':
        return filterHeading(block, filterTerm, blocks);
      case 'horizontal-rule':
        return true;
      case 'list':
        return filterBlocks(block.get('blocks'), filterTerm).length > 0;
      case 'title':
        return true;
      case 'url':
        return filterURL(block, filterTerm);
      default:
        return searchMatch(block.get('content'), filterTerm);
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
