import Ember from 'ember';
import layout from './template';
import styles from './styles';

/**
 * A block that represents the state of editing the placeholder content for its
 * related block.
 *
 * @class CanvasEditor.PlaceholderEditorComponent
 * @extends Ember.Component
 */
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
