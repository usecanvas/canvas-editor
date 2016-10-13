import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import Ember from 'ember';
import layout from './template';
import searchMatch from 'canvas-editor/lib/search-match';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a URL card.
 *
 * @class CanvasEditor.CanvasBlockURLComponent
 * @extends CanvasEditor.CanvasBlockCardComponent
 */
export default CardBlock.extend({
  classNames: ['canvas-block-url'],
  layout,
  localClassNameBindings: ['showAuthComponent:component--needs-auth'],
  localClassNames: ['canvas-block-url'],
  styles,

  isFiltered: computed('filterTerm',
                       'block.meta.url',
                       'unfurled.title',
                       'unfurled.text', function() {
    const term = this.get('filterTerm');

    return [
      this.get('block.meta.url'),
      this.get('unfurled.title'),
      this.get('unfurled.text')
    ].any(value => searchMatch(term, value));
  })
});
