import Ember from 'ember';
import layout from './template';
import styles from './styles';

export default Ember.Component.extend({
  layout,
  localClassNames: ['placeholder-editor'],
  styles,

  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditingPlaceholder');
    }
  }
});
