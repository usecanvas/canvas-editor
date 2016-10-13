import Ember from 'ember';
import searchMatch from 'canvas-editor/lib/search-match';

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
    return searchMatch(this.get('filterTerm'), this.get('block.content'));
  })
});
