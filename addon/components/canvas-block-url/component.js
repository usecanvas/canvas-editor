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
  frameless: computed.equal('unfurled.providerName', 'GitHub Gist'),
  layout,
  localClassNameBindings: [
    'showAuthComponent:canvas-block-url--needs-auth',
    'frameless:canvas-block-url--frameless'
  ],
  localClassNames: ['canvas-block-url'],
  styles,

  frameless: computed('unfurled.providerName', function() {
    return [
      'Framer',
      'GitHub Gist'
    ].includes(this.get('unfurled.providerName'));
  }),

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
