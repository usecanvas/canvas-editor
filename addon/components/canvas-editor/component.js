import Ember from 'ember';
import layout from './template';

/**
 * A component that allows for the editing of a canvas in realtime.
 *
 * @class CanvasEditor.CanvasEditorComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  classNames: ['canvas-editor'],
  layout
});
