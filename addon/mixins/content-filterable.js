import Ember from 'ember';

const { computed } = Ember;

/**
 * Provides an `isFiltered` property that is true if content matches a filter
 * value.
 *
 * @class CanvasEditor.ContentFilterableMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  isFiltered: computed('block.content', 'filterTerm', function() {
    const term = (this.get('filterTerm') || '').toLowerCase();
    if (!term) return true;
    return this.get('block.content').toLowerCase().includes(term);
  })
});
