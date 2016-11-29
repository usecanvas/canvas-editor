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
    Ember.$(document).on(nsEvent('mouseup', this), this.mouseUp.bind(this));
    this.$().on(nsEvent('mousedown', this), this.mouseDown.bind(this));
    this.$().on(nsEvent('mousemove', this), this.mouseMove.bind(this));
  },

  /**
   * Tear down event bindings outside of this manager's element.
   *
   * @method
   */
  teardown() {
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
   * De-select every block.
   *
   * @method
   */
  deSelectAll() {
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
    return blocks.findBy('id', element.id);
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
   * When the user presses mouse down, track the mouse down/up state.
   *
   * @method
   * @param {jQuery.Event} evt The mousedown event fired
   */
  mouseDown(evt) {
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

    if (!(anchorBlock && focusBlock) || anchorBlock === focusBlock) {
      this.deSelectAll();
      return;
    }

    window.getSelection().removeAllRanges();
    this.selectRange(anchorBlock, focusBlock, direction === UP);
  },

  /**
   * When the user releases mouse, track the mouse down/up state.
   *
   * @method
   * @param {jQuery.Event} evt The mouseup event fired
   */
  mouseUp(_evt) {
    this.set('isMouseDown', false);
    this.set('anchorPoint', null);
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

    this.deSelectAll();

    let startIndex = blocks.indexOf(anchor);
    let endIndex = blocks.indexOf(focus);
    if (isReversed) [startIndex, endIndex] = [endIndex, startIndex];

    for (let i = startIndex; i <= endIndex; i += 1) {
      blocks.objectAt(i).set('isSelected', true);
    }
  }
});
