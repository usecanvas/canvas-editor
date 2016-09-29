import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url/styles';

const { computed } = Ember;

export default Ember.Component.extend({
  classNames: ['canvas-block-url-canvas'],
  layout,
  localClassNames: ['canvas-block-url-canvas'],
  styles,

  hasProgress: computed('progress', function() {
    return typeof this.get('progress') === 'number';
  }),

  progress: computed('unfurled.fields', function() {
    const fields = Ember.A(this.get('unfurled.fields'));
    const tasksComplete = getValueFromFields(fields, 'Tasks Complete');
    const tasksTotal = getValueFromFields(fields, 'Tasks Total');

    if (!tasksTotal) return null;
    return tasksComplete / tasksTotal * 100;
  })
});

function getValueFromFields(fields, title) {
  const field = fields.findBy('title', title);
  if (!field || !field.hasOwnProperty('value')) return null;

  return field.value;
}
