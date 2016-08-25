import Ember from 'ember';
import SelectionService from 'canvas-editor/lib/selection';

const { computed } = Ember;

/**
 * A mixin providing access to the selection service and its selection property.
 *
 * @class CanvasEditor.SelectionMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  currentRange: computed(function() {
    return SelectionService.get('currentRange');
  }).volatile(),

  currentRangeRect: computed(function() {
    return SelectionService.get('currentRangeRect');
  }).volatile(),

  selection: computed(function() {
    return SelectionService.get('selection');
  }).volatile()
});
