import Ember from 'ember';
import MarkdownIt from 'markdown-it';

/**
 * Helper for rendering a Markdown string as HTML.
 *
 * @module CanvasEditor.MarkdownItHelper
 */

const renderer = new MarkdownIt();

/**
 * Convert a Markdown string to a safe HTML string.
 *
 * @function
 * @param {Array<string>} params The params passed to the helper
 * @param {Object} hash The options hash passed to the helper
 */
export function markdownIt([text], hash = {}) {
  let markdownHTML;

  if (hash.inline) {
    markdownHTML = renderer.renderInline(text);
  } else {
    markdownHTML = renderer.render(text);
  }

  return Ember.String.htmlSafe(markdownHTML);
}

export default Ember.Helper.helper(markdownIt);
