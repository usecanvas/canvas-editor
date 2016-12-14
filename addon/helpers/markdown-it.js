import Ember from 'ember';
import MarkdownIt from 'markdown-it';

const markdownIt = new MarkdownIt();

export function markdownItHelper([text], hash = {}) {
  let markdownHTML;

  if (hash.inline) {
    markdownHTML = markdownIt.renderInline(text);
  } else {
    markdownHTML = markdownIt.render(text);
  }

  return Ember.String.htmlSafe(markdownHTML);
}

export default Ember.Helper.helper(markdownItHelper);
