import Ember from 'ember';
import nsEvent from 'canvas-editor/lib/ns-event';

const { computed, on } = Ember;

/**
 * A mixin that provides multi-block-selection functionality to the canvas
 * editor.
 *
 * @class CanvasEditor.MultiBlockSelectMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  /**
   * The block to which the user selection is anchored (started at)
   * @member {?CanvasEditor.RealtimeCanvas.Block}
   */
  anchorBlock: computed('anchorPoint', function() {
    if (!this.get('anchorPoint')) return null;
    const anchorElement =
      document.elementFromPoint(...Object.values(this.get('anchorPoint')));
    const blockEl = this.$(anchorElement).closest('.canvas-block').get(0);
    return blockEl ? this.getNavigableBlocks().findBy('id', blockEl.id) : null;
  }),

  /**
   * The point to which the user selection is anchored (started at)
   * @member {?object}
   */
  anchorPoint: null,

  /**
   * @member {boolean} Whether the mouse is currently down
   */
  isMouseDown: false,

  /**
   * @member {boolean} Whether the user is selecting
   */
  isSelecting: false,

  /**
   * Bind the `mouseup` event so that we know when a user stops dragging outside
   * of the editor.
   *
   * @method
   */
  mbBindEvents: on('didInsertElement', function() {
    Ember.$(document).on(nsEvent('mouseup', this), this.mbMouseUp.bind(this));
  }),

  /**
   * Unbind the `mouseup` event.
   *
   * @method
   */
  mbUnbindEvents: on('willDestroyElement', function() {
    Ember.$(document).off(nsEvent('mouseup', this));
  }),

  /**
   * When the user presses mouse down, track the mouse down/up state.
   *
   * @method
   * @param {jQuery.Event} evt The mousedown event fired
   */
  mbMouseDown: on('mouseDown', function(evt) {
    this.set('isMouseDown', true);
    this.set('anchorPoint', { x: evt.clientX, y: evt.clientY });
  }),

  /**
   * Track the position of the pointer when the user is dragging to determine
   * whether a multi-block selection should begin.
   *
   * @method
   * @param {jQuery.Event} evt The mousemove event fired
   */
  mbMouseMove: on('mouseMove', function(evt) {
    if (!this.get('isMouseDown')) return;
    const yCoord = evt.clientY;
    const direction = yCoord > this.get('anchorPoint.y') ? 'down' : 'up';
    console.log(this.get('anchorBlock'));
  }),

  /**
   * When the user releases mouse, track the mouse down/up state.
   *
   * @method
   * @param {jQuery.Event} evt The mouseup event fired
   */
  mbMouseUp: on('mouseUp', function(_evt) {
    this.set('isMouseDown', false);
    this.set('anchorPoint', null);
  }),
});
