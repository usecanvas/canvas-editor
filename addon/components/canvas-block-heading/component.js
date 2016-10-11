import CanvasBlock from 'canvas-editor/components/canvas-block/component';
import ContentFilterable from 'canvas-editor/mixins/content-filterable';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A component representing a "heading" type canvas block.
 *
 * @class CanvasEditor.CanvasBlockHeadingComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default CanvasBlock.extend(ContentFilterable, {
  classNames: ['canvas-block-heading'],
  layout,
  classNameBindings: ['levelClass'],
  localClassNames: ['canvas-block-heading'],
  styles,

  levelClass: computed('block.meta.level', function() {
    return this.get('styles')[`heading-level-${this.get('block.meta.level')}`];
  })
});
