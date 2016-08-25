import ContentEditable from 'canvas-editor/mixins/content-editable';
import Ember from 'ember';

export default Ember.Component.extend(ContentEditable, {
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block-paragraph']
});
