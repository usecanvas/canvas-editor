import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

export default Ember.Component.extend({
  classNameBindings: ['typeClassName'],
  withoutChildren: computed.not('block.blocks'),
  layout,
  localClassNames: ['canvas-block-wrapper'],
  localClassNameBindings: ['withoutChildren'],
  styles,

  typeClassName: computed('block.type', function() {
    const type = this.get('block.type');
    return this.get(`styles.${type}`);
  })
});
