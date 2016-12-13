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
   * Determine whether the selection is at the end of a given selector.
   *
   * @method
   * @param {string} selector The selector
   * @returns {boolean} Whether the selection is at the end of `selector`
   */
  isAtEnd(selector) {
    const range = this.get('currentRange');

    if (!range) return false;

    const endNode = range.endContainer;
    const isLastChild = this.isLastChild(endNode, selector);

    if (!isLastChild) return false;

    if (endNode.nodeType === Node.ELEMENT_NODE) {
      return range.endOffset === endNode.childNodes.length ||
        endNode.childNodes.length === 1 &&
         endNode.childNodes[0].nodeName === 'BR';
    }

    return range.endOffset === endNode.textContent.length;
  },

  /**
   * Determine whether the selection is at the start of a given selector.
   *
   * @method
   * @param {string} selector The selector
   * @returns {boolean} Whether the selection is at the start of `selector`
   */
  isAtStart(selector) {
    const range = this.get('currentRange');

    if (!range) return false;

    const startNode = range.startContainer;
    return this.isFirstChild(startNode, selector) && range.startOffset === 0;
  },

  /**
   * Determine whether the node has any content nodes before it.
   *
   * This method ascends up to the given `selector` recursively and stops if
   * it reaches a node that is not the first child of its parent. Text nodes
   * that have no content are considered empty.
   *
   * ```html
   * <div id='test'>
   *   '' <!-- is first -->
   *   <div> <!-- is first -->
   *     <div> <!-- is first -->
   *       '' <!-- is first -->
   *       'foo' <!-- is first -->
   *       <i>'bar'</i> <!-- is not first -->
   *     </div>
   *     <div></div> <!-- is not first -->
   *   </div>
   * </div>
   * ```
   *
   * @method
   * @param {Node} node The node to test
   * @param {string} selector A selector to ascend to
   * @returns {boolean} Whether the node is a "first child" node
   */
  isFirstChild(node, selector) {
    let firstChild = node.parentElement.childNodes[0];

    while (firstChild.nodeType === Node.TEXT_NODE &&
           firstChild.textContent === '') {
      firstChild = firstChild.nextSibling;
    }

    if (Ember.$(node).is(selector)) {
      return true;
    } else if (node === firstChild || firstChild.textContent === '') {
      return this.isFirstChild(node.parentElement, selector);
    }

    return false;
  },

  /**
   * Determines whether the node has any content nodes after it.
   *
   * This is effectively the reverse if `isFirstChild`.
   *
   * @method
   * @param {Node} node The node to test
   * @param {string} selector A selector to ascend to
   * @returns {boolean} Whether the node is a "last child" node
   */
  isLastChild(node, selector) {
    const children = node.parentElement.childNodes;

    let lastChild = children[children.length - 1];

    while (lastChild.type === Node.TEXT_NODE &&
           lastChild.textContent === '') {
      lastChild = lastChild.previousSibling;
    }

    if (Ember.$(node).is(selector)) {
      return true;
    } else if (node === lastChild || lastChild.textContent === '') {
      return this.isLastChild(node.parentElement, selector);
    }

    return false;
  },

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
