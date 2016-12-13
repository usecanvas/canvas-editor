import Ember from 'ember';
import Rangy from 'rangy';
import { caretRangeFromPoint } from './range-polyfill';

const { computed } = Ember;

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
    this.get('selection').refresh();
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

  /**
   * Given a target block and a client rect for the current range, navigate
   * down to the next focusable block.
   *
   * @method
   * @param {JQuery.Element} $container The parent container of the entire
   *   editor
   * @param {CanvasEditor.RealtimeCanvas.Block} nextBlock The block to navigate
   *   into
   * @param {ClientRect} rangeRect The user range used to determine the
   *   horizontal position of the selection upon navigation
   */
  navigateDownToBlock($container, nextBlock, rangeRect) {
    this.navigateBlockBasedOnRect({
      $container,
      block: nextBlock,
      rangeRect,
      boundary: 'top' });
  },

  /**
   * Given a target block and a client rect for the current range, navigate
   * up to the previous focusable block.
   *
   * @method
   * @param {JQuery.Element} $container The parent container of the entire
   *   editor
   * @param {CanvasEditor.RealtimeCanvas.Block} prevBlock The block to navigate
   *   into
   * @param {ClientRect} rangeRect The user range used to determine the
   *   horizontal position of the selection upon navigation
   */
  navigateUpToBlock($container, prevBlock, rangeRect) {
    this.navigateBlockBasedOnRect({
      $container,
      block: prevBlock,
      rangeRect,
      boundary: 'bottom' });
  },

  /* eslint-disable max-statements */
  /**
   * Navigate to a specific block, using a range to determine the horizontal
   * position of the selection upon navigation.
   *
   * @method
   * @param {object} opts An object of options for use in navigation
   * @param {JQuery.Element} [opts.$container] The parent container of the
   *   entire editor
   * @param {CanvasEditor.CanvasRealtime.Block} [opts.block] The block to
   *   navigate into
   * @param {ClientRect} [opts.rangeRect] The user range used to determine
   *   horizontal position
   * @param {string} [opts.boundary] The "top" or "bottom" boundary that we
   *   are navigating into
   */
  navigateBlockBasedOnRect({ $container, block, rangeRect, boundary }) {
    const blockElement = this.getEditableBlockElement($container, block);

    const targetRange = Rangy.createRange();
    targetRange.selectNodeContents(blockElement);
    const blockRects = targetRange.nativeRange.getClientRects();
    let blockRect = blockRects[blockRects.length - 1];
    if (boundary === 'top') blockRect = blockRects[0];

    let offset = parseInt(getComputedStyle(blockElement).fontSize, 10) / 3;
    if (boundary === 'bottom') offset *= -1;

    /*
     * Create a point using the `left` value from the current range, and the
     * `boundary` value of the target block. We apply an offset based on the
     * computed font size of the target element in order to find a valid space.
     */
    const point = [rangeRect.left, blockRect[boundary] + offset];
    let range = caretRangeFromPoint(...point);

    /**
     * Fall back if a range could not be found.
     */
    if (!range) {
      console.warn('Range not found.');

      range = document.createRange();

      if (boundary === 'top') {
        range.setStart(blockElement, 0);
      } else {
        range.setStart(blockElement, blockElement.childNodes.length);
      }
    }

    range = new Rangy.WrappedRange(range);
    this.get('selection').setSingleRange(range);
    blockElement.focus();
    this.scrollTo(blockElement);
  },
  /* eslint-enable max-statements */

  /**
   * Select a card block (they do not have editable text, and have a special
   * "selected" state).
   *
   * @method
   * @param {jQuery.Element} $container The container of the editor
   * @param {CanvasEditor.RealtimeCanvas.CardBlock} block The block to select
   */
  selectCardBlock($container, block) {
    const blockElement = this.getBlockElement($container, block);
    this.get('selection').removeAllRanges();
    $container.find(':focus').blur();
    blockElement.setAttribute('data-card-block-selected', true);

    if (block.get('isEditableCard')) {
      const editable = this.getEditableBlockElement($container, block);
      if (editable) editable.focus();
    }
  },

  /**
   * Get the element associated with a given block.
   *
   * @method
   * @private
   * @param {jQuery.Element} $container The container of the editor
   * @param {CanvasEditor.RealtimeCanvas.CardBlock} block The block to get the
   *   element for
   * @returns {Element} The element associated with `block`
   */
  getBlockElement($container, block) {
    return $container
      .find(`#${block.get('id')}`)
      .get(0);
  },

  /**
   * Get the editable element associated with a given block.
   *
   * @method
   * @private
   * @param {jQuery.Element} $container The container of the editor
   * @param {CanvasEditor.RealtimeCanvas.CardBlock} block The block to get the
   *   element for
   * @returns {Element} The element associated with `block`
   */
  getEditableBlockElement($container, block) {
    return Ember.$(this.getBlockElement($container, block))
      .find('.canvas-block-editable')
      .get(0);
  },

  /**
   * Scroll to a block if needed.
   *
   * @method
   * @param {HTMLElement} element The element to scroll to if possible
   */
  scrollTo(element) {
    if (element.scrollIntoViewIfNeeded) {
      element.scrollIntoViewIfNeeded();
    }
  }
});

export default SelectionService.create();
