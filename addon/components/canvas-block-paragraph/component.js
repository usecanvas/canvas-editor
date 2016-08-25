import ContentEditable from 'canvas-editor/mixins/content-editable';
import Ember from 'ember';

/**
 * A component representing a "paragraph" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockParagraphComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(ContentEditable, {
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block-paragraph']
});
