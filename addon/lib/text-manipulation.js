import Ember     from 'ember';
import Selection from 'canvas-editor/mixins/selection';

const { computed } = Ember;

/**
 * A class for beginning a text manipulation event. Instances of this class
 * contain metadata about a pending text manipulation.
 *
 * @class CanvasEditor.TextManipulation
 * @extends Ember.Object
 */
export default Ember.Object.extend(Selection, {
  textAfterSelection: computed(function() {
    const range = this.get('currentRange');
    const rangeWithTextAfter = range.cloneRange();
    rangeWithTextAfter.collapse();
    rangeWithTextAfter.setEndAfter(this.get('element'));
    return rangeWithTextAfter.text().replace(/\n$/, '');
  }),

  textBeforeSelection: computed(function() {
    const range = this.get('currentRange');
    const rangeWithTextBefore = range.cloneRange();
    rangeWithTextBefore.collapse(true);
    rangeWithTextBefore.setStartBefore(this.get('element'));
    return rangeWithTextBefore.text().replace(/\n$/, '');
  })
}).reopenClass({
  getManipulation(element) {
    const manipulation = this.create({ element });

    // Ensure the virtual selection is accurate
    manipulation.get('selection').refresh();

    return manipulation
               .getProperties('textBeforeSelection', 'textAfterSelection');
  }
});
