import ContentBlock from './content-block';
import Ember from 'ember';

const { computed } = Ember;

/**
 * A block representing a code block.
 *
 * @class CanvasEditor.RealtimeCanvas.Code
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'code',
  meta: computed(_ => Ember.Object.create({ language: null }))
}).reopenClass({
  pattern: /^(`{3})(\S*)$/,
  createFromMarkdown(source) {
    const [_, language] = source.match(/^```(\S+)?$/);
    return this.create({ meta: { language } });
  }
});
