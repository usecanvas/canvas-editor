import BlockEvents from 'canvas-editor/mixins/block-events';
import Ember from 'ember';
import styles from './styles';

/**
 * A generic component to be extended for representing canvas blocks.
 *
 * @class CanvasEditor.CanvasBlockComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(BlockEvents, {
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block'],
  isFocused: false,
  localClassNames: ['component'],
  styles
});
