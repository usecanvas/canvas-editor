import Ember from 'ember';
import FocusBlur from 'canvas-editor/mixins/focus-blur';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend(FocusBlur, {
  classNameBindings: ['typeClassName'],
  layout,
  localClassNames: ['canvas-block-wrapper'],
  localClassNameBindings: ['withActions'],
  styles,
  withActions: computed.not('block.blocks'),

  typeClassName: computed('block.type', function() {
    const type = this.get('block.type');
    return this.get(`styles.${type}`);
  })
});
