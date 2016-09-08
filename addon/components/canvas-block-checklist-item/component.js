import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import layout from './template';
import styles from './styles';

/**
 * A component representing a checklist item.
 *
 * @class CanvasEditor.CanvasBlockChecklistItemComponent
 * @extends CanvasEditor.CanvasBlockComponent
 */
export default Ember.Component.extend({
  tagName: 'li',
  localClassNames: ['canvas-block-checklist-item'],
  classNames: ['canvas-block-checklist-item'],
  layout,
  styles,
  nextBlockConstructor: ChecklistItem
});
