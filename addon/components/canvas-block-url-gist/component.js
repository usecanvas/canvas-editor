import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url-gist/styles';

const { computed, on } = Ember;

export default Ember.Component.extend({
  classNames: ['canvas-block-url-gist'],
  layout,
  localClassNames: ['canvas-block-url-gist'],
  styles,

  html: computed.oneWay('unfurled.html', function() {
    return Ember.String.htmlSafe('unfurled.html');
  }
});
