import BlockEvents from 'canvas-editor/mixins/block-events';
import Ember from 'ember';
import styles from './styles';

const { computed } = Ember;

/**
 * A generic component to be extended for representing canvas blocks.
 *
 * @class CanvasEditor.CanvasBlockComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(BlockEvents, {
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block'],
  isEditingPlaceholder: false,
  isFocused: false,
  localClassNames: ['canvas-block'],
  localClassNameBindings: ['isFocused', 'isSelected'],
  isSelected: computed.readOnly('block.isSelected'),
  styles,

  init() {
    this.set('elementId', this.get('block.id'));
    this._super(...arguments);
  }
});
