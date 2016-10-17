import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url-github-gist/styles';

const { computed } = Ember;

export default Ember.Component.extend({
  classNames: ['canvas-block-url-github-gist'],
  layout,
  localClassNames: ['canvas-block-url-github-gist'],
  localClassNameBindings: ['isFocused'],
  styles
});
