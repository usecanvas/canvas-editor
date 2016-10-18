import Ember from 'ember';
import layout from './template';
import styles from 'canvas-editor/components/canvas-block-url/styles';

const { computed } = Ember;

const TASKS_COMPLETE = 'Tasks Complete';
const TASKS_TOTAL = 'Tasks Total';

export default Ember.Component.extend({
  classNames: ['canvas-block-url-canvas'],
  layout,
  localClassNames: ['canvas-block-url-canvas'],
  styles,

  canvasId: computed('unfurled.url', function() {
    return this.get('unfurled.url').split('/')[4];
  }),

  hasProgress: computed('progress', function() {
    return getValueFromFields(Ember.A(this.get('unfurled.fields')),
      TASKS_TOTAL) > 0;
  }),

  progress: computed('unfurled.fields.[]', function() {
    const fields = Ember.A(this.get('unfurled.fields'));
    const tasksTotal = getValueFromFields(fields, TASKS_TOTAL);
    const tasksComplete = getValueFromFields(fields, TASKS_COMPLETE);

    if (!tasksTotal) return null;
    return tasksComplete / tasksTotal * 100;
  }),

  typeIcon: computed('unfurled.type', function() {
    switch (this.get('unfurled.type')) {
      case 'canvas:heading':
        return 'Receipt';
      default:
        return 'Document';
    }
  })
});

function getValueFromFields(fields, title) {
  return fields.findBy('title', title).value;
}
