import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url-framer/styles';

export default Ember.Component.extend({
  classNames: ['canvas-block-url-framer'],
  layout,
  localClassNames: ['canvas-block-url-framer'],
  localClassNameBindings: ['isFocused'],
  styles
});
