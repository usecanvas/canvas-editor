import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed, inject } = Ember;

export default Ember.Component.extend({
  dropBar: inject.service(),
  layout,
  localClassNames: ['canvas-drop-bar'],
  localClassNameBindings: ['isDroppable'],
  styles,

  isDroppable: computed('afterBlockId', 'dropBar.insertAfter', function() {
    return this.get('afterBlockId') === this.get('dropBar.insertAfter');
  })
});
