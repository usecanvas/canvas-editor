import Block from './block';

/**
 * A block representing a URL.
 *
 * @class CanvasEditor.RealtimeCanvas.URL
 * @extends CanvasEditor.RealtimeCanvas.Block
 */
export default Block.extend({
  content: null,
  isCard: true,
  lastContent: null,
  type: 'url'
}).reopenClass({
  pattern: /^https?:\/\/.*$/,
  createFromMarkdown(url) {
    return this.create({ meta: { url } });
  }
});
