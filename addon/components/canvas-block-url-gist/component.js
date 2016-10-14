import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url/styles';

export default Ember.Component.extend({
  classNames: ['canvas-block-url-gist'],
  layout,
  localClassNames: ['canvas-block-url-gist'],
  styles
});
