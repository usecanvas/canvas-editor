import Ember from 'ember';
import layout from './template';
import styles from './styles';

const { computed } = Ember;

/**
 * A computed which displays a Slack message
 *
 * @class CanvasEditor.SlackMessageComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  layout,
  localClassNames: ['slack-message'],
  styles,

  /**
   * @property {number} The Slack timestamp converted to a Unix millisecond
   *   timestamp value.
   */
  unixTimestamp: computed('message.timestamp', function() {
    return parseFloat(this.get('message.timestamp')) * 1000;
  })
});
