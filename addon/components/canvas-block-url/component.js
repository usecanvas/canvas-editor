import CardBlock from 'canvas-editor/components/canvas-block-card/component';
import Ember from 'ember';
import layout from './template';
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
  })
});
