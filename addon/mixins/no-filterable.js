import Ember from 'ember';

const { computed } = Ember;

/**
 * A mixin that adds `isFiltered` that is only true when there is no filter
 * term.
 *
 * @class CanvasEditor.NoFilterableMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  isFiltered: computed.not('filterTerm')
});
