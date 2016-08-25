import Ember from 'ember';
import Rangy from 'rangy';

const { computed, get } = Ember;

/**
 * A service providing access to a user's selection in the DOM.
 *
 * This is not a normal Ember service, because we need access to this singleton
 * outside of containers at times.
 *
 * @class CanvasEditor.SelectionService
 * @extends Ember.Object
 */
const SelectionService = Ember.Object.extend({
  init() {
    Rangy.init();
  },

  currentRange: computed(function() {
    return this.get('selection').getRangeAt(0);
  }).volatile(),

  currentRangeRect: computed(function() {
    const range = this.get('currentRange');
    const placeholder = document.createElement('span'); // Position placeholder
    placeholder.appendChild(document.createTextNode('\u200b')); // Give width
    range.insertNode(placeholder);
    const rect = placeholder.getClientRects()[0]; // Get placeholder rect
    const placeholderParent = placeholder.parentNode;
    placeholderParent.removeChild(placeholder); // Remove placeholder
    placeholderParent.normalize(); // Glue split nodes back together
    return rect;
  }).volatile(),

  selection: computed(function() {
    return Rangy.getSelection();
  }),

  navigateDownToBlock($container, nextBlock, rangeRect) {
    this.navigateBlockBasedOnRect({
      $container,
      block: nextBlock,
      rangeRect,
      boundary: 'top',
      offset: 10 });
  },

  navigateUpToBlock($container, prevBlock, rangeRect) {
    this.navigateBlockBasedOnRect({
      $container,
      block: prevBlock,
      rangeRect,
      boundary: 'bottom',
      offset: -10 });
  },

  navigateBlockBasedOnRect({ $container, block, rangeRect, boundary, offset }) {
    const blockElement =
      $container
        .find(`[data-block-id="${get(block, 'id')}"]`)
        .get(0);

    const blockRect = blockElement.getClientRects()[0];
    /*
     * Create a point using the `left` value from the current range, and the
     * `boundary` value of the next block. We add to or subtract from the
     * boundary value to compensate for space around the text, such as padding.
     */
    const point = [rangeRect.left, blockRect[boundary] + offset];

    let range;
    if (document.caretPositionFromPoint) {
      range = document.caretPositionFromPoint(...point);
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(...point);
    }

    range = new Rangy.WrappedRange(range);
    this.get('selection').setSingleRange(range);
  }
});

export default SelectionService.create();
