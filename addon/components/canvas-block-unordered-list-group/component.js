import Ember from 'ember';
import layout from './template';

/**
 * A component for rendering unordered list groups.
 *
 * @class CanvasEditor.CanvasBlockUnorderedListGroupComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  localClassNames: 'canvas-block-unordered-list-group',
  tagName: 'ul',
  layout
});
