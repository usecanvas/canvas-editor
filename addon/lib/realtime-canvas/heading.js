import ContentBlock from './content-block';
import Ember from 'ember';

const { computed } = Ember;
const LEVEL_REG = /^(#{1,6})\s+([\s\S]*)$/;

/**
 * A block representing a heading.
 *
 * @class CanvasEditor.RealtimeCanvas.Heading
 * @extends CanvasEditor.RealtimeCanvas.ContentBlock
 */
export default ContentBlock.extend({
  type: 'heading',
  meta: computed(_ => Ember.Object.create({ level: 1 }))
}).reopenClass({
  createFromMarkdown(markdown, properties) {
    const match = markdown.match(LEVEL_REG);
    const level = match[1].length;
    const content = match[2];

    return this.create(
      Object.assign(properties, { content, meta: { level } })
    );
  }
});
