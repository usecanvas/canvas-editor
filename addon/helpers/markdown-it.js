import Ember from 'ember';
import MarkdownIt from 'markdown-it';

const renderer = new MarkdownIt();

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
