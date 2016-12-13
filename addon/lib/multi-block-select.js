import Ember from 'ember';
import flattenBy from 'canvas-editor/lib/flatten-by';
import nsEvent from 'canvas-editor/lib/ns-event';

const { computed } = Ember;
const [DOWN, UP] = [10, -10];
const MAX_SEARCH = 500;

/**
 * A class that provides multi-block-selection functionality to the canvas
 * editor.
 *
 * @class CanvasEditor.MultiBlockSelect
 * @extends Ember.Object
 */
export default Ember.Object.extend({
  /**
   * The point to which the user selection is anchored (started at)
   * @member {?object}
   */
  anchorPoint: null,

  /**
   * @member {?CanvasEditor.RealtimeCanvas} The canvas in the editor
   */
  canvas: null,

  /**
   * @member {?Element} The element to track selection in
   */
  element: null,

  /**
   * @member {boolean} Whether the mouse is currently down
   */
  isMouseDown: false,

  /**
   * Whether the selection anchor is after the focus
   * @member {boolean}
   */
  isReversed: false,

  /**
   * @member {boolean} Whether a selection exists
   */
  isSelecting: false,

  /**
   * The x coordinate halfway across the canvas.
   *
   * @member {number}
   */
  centerCoordinate: computed(function() {
    const left = this.$().offset().left;
    const width = this.$().width();
    return left + width / 2;
  }).volatile(),

  /**
   * Calls `setup` when the manager is initialized.
   *
   * @method
   */
  init() {
    this._super(...arguments);
    this.setup();
  },

  /**
   * Set up event bindings.
   *
   * @method
   */
  setup() {
    Ember.$(document).on(nsEvent('mousedown', this), this.mouseDown.bind(this));
    Ember.$(document).on(nsEvent('mousemove', this), this.mouseMove.bind(this));
    Ember.$(document).on(nsEvent('mouseup', this), this.mouseUp.bind(this));
  },

  /**
   * Tear down event bindings outside of this manager's element.
   *
   * @method
   */
  teardown() {
    Ember.$(document).off(nsEvent('mousedown', this));
    Ember.$(document).off(nsEvent('mousemove', this));
    Ember.$(document).off(nsEvent('mouseup', this));
  },

  /**
   * Return a jQuery.Element of this manager's element, finding the selector
   * within it if provided.
   *
   * @method
   * @param {?object} selector The selector to search with
   * @returns {jQuery.Element}
   */
  $(selector) {
    const $this = Ember.$(this.get('element'));
    if (selector) return $this.find(selector);
    return $this;
  },

  /**
   * Collapse the selection.
   *
   * @method
   * @param {boolean} [toStart=false] Whether to collapse to the start
   * @returns {CanvasEditor.MultiBlockSelect} this
   */
  collapse(toStart = false) {
    const blocks = this.getSelectedBlocks();

    if (toStart) {
      blocks.slice(1).setEach('isSelected', false);
    } else {
      blocks.slice(0, blocks.get('length') - 1).setEach('isSelected', false);
    }

    return this;
  },

  /**
   * De-select every block and set state to de-selected.
   *
   * @method
   */
  deSelectAll() {
    this.set('isSelecting', false);
    this.deSelectBlocks();
  },

  /**
   * De-select every block, but do not change selection state.
   *
   * This is because we de-select and select only selected blocks during mouse
   * movement, but do not want to change `isSelecting`.
   *
   * @method
   */
  deSelectBlocks() {
    this.getNavigableBlocks().setEach('isSelected', false);
  },

  /**
   * Given a y coordinate, find the block that occupies space at that
   * coordinate.
   *
   * We ignore the x-coordinate (by setting it to halfway across the canvas)
   * because blocks are only laid out along the y coordinate (vertically).
   *
   * @method
   * @param {number} yCoord The y coordinate value to find the block at
   * @param {number} [searchIncrement=0] The amount by which to offset the y
   *   coordinate to search for a block if one is not at the exact coordinate
   * @return {?Element} The block (or null) found at the point
   */
  getBlockAtY(yCoord, searchIncrement = 0) {
    const xCoord = this.get('centerCoordinate');
    const element = document.elementFromPoint(xCoord, yCoord);

    let blockElement =
      this.$(element)
          .closest('.canvas-block')
          .not('.canvas-block-list')
          .get(0) || null;

    if (!blockElement && searchIncrement) {
      let offset = 0;
      while (!blockElement && offset > -MAX_SEARCH && offset < MAX_SEARCH) {
        offset += searchIncrement;
        blockElement = this.getBlockAtY(yCoord + offset);
      }
    }

    return blockElement;
  },

  /**
   * Given an element, get the block associated with it.
   *
   * Accepts an array of blocks so that `getNavigableBlock` is not called over
   * and over.
   *
   * @method
   * @param {Element} element The element to find the block for
   * @param {Array<CanvasEditor.RealtimeCanvas.Block} blocks The blocks to
   *   search through
   */
  getBlockFromElement(element, blocks) {
    return blocks.findBy('id', element.getAttribute('data-block-id'));
  },

  /**
   * Get the flattened blocks of this manager's canvas.
   *
   * @method
   * @returns {Ember.Array<CanvasEditor.RealtimeCanvas.Block>}
   */
  getNavigableBlocks() {
    return flattenBy(this.get('canvas.blocks'), 'isGroup', 'blocks');
  },

  /**
   * Get the selected blocks of this manager's canvas.
   *
   * @method
   * @returns {Ember.Array<CanvasEditor.RealtimeCanvas.Block>}
   */
  getSelectedBlocks() {
    return this.getNavigableBlocks().filterBy('isSelected');
  },

  /**
   * When the user presses mouse down, track the mouse down/up state.
   *
   * @method
   * @param {jQuery.Event} evt The mousedown event fired
   */
  mouseDown(evt) {
    if (evt.which !== 1 || evt.ctrlKey) return;
    this.deSelectAll();
    this.set('isMouseDown', true);
    this.set('anchorPoint', { x: evt.clientX, y: evt.clientY });
  },

  /**
   * Track the position of the pointer when the user is dragging to determine
   * whether a multi-block selection should begin.
   *
   * @method
   * @param {jQuery.Event} evt The mousemove event fired
   */
  mouseMove(evt) {
    if (!this.get('isMouseDown')) return;

    const yCoord = evt.clientY;
    const direction = yCoord > this.get('anchorPoint.y') ? DOWN : UP;
    const anchorBlock = this.getBlockAtY(this.get('anchorPoint.y'), direction);
    const focusBlock = this.getBlockAtY(yCoord, -direction);

    this.set('isReversed', direction === UP);

    if (!(anchorBlock && focusBlock) ||
        !this.get('isSelecting') && anchorBlock === focusBlock) {
      this.deSelectAll();
      return;
    }

    window.getSelection().removeAllRanges();
    this.set('isSelecting', true);
    this.selectRange(anchorBlock, focusBlock, direction === UP);
  },

  /**
   * When the user releases mouse, track the mouse down/up state.
   *
   * @method
   * @param {jQuery.Event} evt The mouseup event fired
   */
  mouseUp(_evt) {
    this.set('isSelecting', false);
    this.set('isMouseDown', false);
    this.set('anchorPoint', null);
    if (this.getSelectedBlocks().objectAt(0)) {
      window.getSelection().removeAllRanges();
    }
  },

  /**
   * Select all blocks.
   *
   * @method
   */
  selectAll() {
    this.set('isSelecting', true);
    this.selectToStart();
    this.selectToEnd();
  },

  /**
   * Select the given block.
   *
   * @method
   * @param {CanvasEditor.RealtimeCanvas.Block} block The block to select
   */
  selectBlock(block) {
    this.set('isSelecting', true);
    block.set('isSelected', true);
  },

  /**
   * Select the range from anchor element to focus element, inclusive.
   *
   * @method
   * @param {Element} anchorEl The element of the selection anchor
   * @param {Element} focusEl The element of the selection focus
   * @param {boolean} isReversed Whether the selection is reversed (up, not
   *   down)
   */
  selectRange(anchorEl, focusEl, isReversed) {
    const blocks = this.getNavigableBlocks();
    const anchor = this.getBlockFromElement(anchorEl, blocks);
    const focus = this.getBlockFromElement(focusEl, blocks);

    this.deSelectBlocks();

    let startIndex = blocks.indexOf(anchor);
    let endIndex = blocks.indexOf(focus);
    if (isReversed) [startIndex, endIndex] = [endIndex, startIndex];

    for (let i = startIndex; i <= endIndex; i += 1) {
      blocks.objectAt(i).set('isSelected', true);
    }
  },

  /**
   * Move the selection downwards, expanding or contracting depending on whether
   * `isReversed`.
   *
   * @method
   */
  selectDown() {
    const blocks = this.getNavigableBlocks();
    const selectedBlocks = blocks.filterBy('isSelected');

    if (this.get('isReversed')) {
      if (selectedBlocks.get('length') === 1) {
        const idx = blocks.indexOf(selectedBlocks.get('firstObject'));
        const nextBlock = blocks.objectAt(idx + 1);
        if (!nextBlock) return;
        nextBlock.set('isSelected', true);
        this.set('isReversed', false);
      } else {
        selectedBlocks.get('firstObject').set('isSelected', false);
      }
    } else {
      const idx = blocks.indexOf(selectedBlocks.get('lastObject'));
      const nextBlock = blocks.objectAt(idx + 1);
      if (!nextBlock) return;
      nextBlock.set('isSelected', true);
    }
  },

  /**
   * Expand the selection to the end.
   *
   * @method
   */
  selectToEnd() {
    const blocks = this.getNavigableBlocks();

    for (let i = blocks.get('length') - 1; i >= 0; i -= 1) {
      const block = blocks.objectAt(i);
      if (block.get('isSelected')) break;
      block.set('isSelected', true);
    }
  },

  /**
   * Expand the selection to the start.
   *
   * @method
   */
  selectToStart() {
    const blocks = this.getNavigableBlocks();

    for (let i = 0, len = blocks.get('length'); i < len; i += 1) {
      const block = blocks.objectAt(i);
      if (block.get('isSelected')) break;
      block.set('isSelected', true);
    }
  },

  /**
   * Move the selection upwards, expanding or contracting depending on whether
   * `isReversed`.
   *
   * @method
   */
  selectUp() {
    const blocks = this.getNavigableBlocks();
    const selectedBlocks = blocks.filterBy('isSelected');

    if (this.get('isReversed')) {
      const idx = blocks.indexOf(selectedBlocks.get('firstObject'));
      if (idx === 0) return;
      blocks.objectAt(idx - 1).set('isSelected', true);
    } else if (selectedBlocks.get('length') === 1) {
      const idx = blocks.indexOf(selectedBlocks.get('firstObject'));
      const prevBlock = blocks.objectAt(idx - 1);
      if (!prevBlock) return;
      prevBlock.set('isSelected', true);
      this.set('isReversed', true);
    } else {
      selectedBlocks.get('lastObject').set('isSelected', false);
    }
  },

  /**
   * Shift the selection down.
   *
   * @method
   */
  shiftDown() {
    const blocks = this.getNavigableBlocks();
    const selectedBlocks = blocks.filterBy('isSelected');
    const idx = blocks.indexOf(selectedBlocks.get('lastObject'));
    const nextBlock = blocks.objectAt(idx + 1);

    if (!nextBlock) return;

    selectedBlocks.get('firstObject').set('isSelected', false);
    nextBlock.set('isSelected', true);
  },

  /**
   * Shift the selection up.
   *
   * @method
   */
  shiftUp() {
    const blocks = this.getNavigableBlocks();
    const selectedBlocks = blocks.filterBy('isSelected');
    const idx = blocks.indexOf(selectedBlocks.get('firstObject'));
    const prevBlock = blocks.objectAt(idx - 1);

    if (!prevBlock) return;

    selectedBlocks.get('lastObject').set('isSelected', false);
    prevBlock.set('isSelected', true);
  }
});
