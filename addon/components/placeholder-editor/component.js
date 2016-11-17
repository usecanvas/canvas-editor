import Ember from 'ember';
import Selection from 'canvas-editor/mixins/selection';
import SelectionState from 'canvas-editor/lib/selection-state';
import { highlight } from 'canvas-editor/lib/markdown/parser';

const { computed, observer, on } = Ember;
const isFirefox = window.navigator.userAgent.includes('Firefox');

export default Ember.Component.extend(Selection, {
  attributeBindings: ['contentEditable:contenteditable'],
  contentEditable: computed.readOnly('editingEnabled'),

  selectionState: computed(function() {
    return new SelectionState(this.get('element'));
  }),

  getElementText() {
    const element = this.get('element');
    if (element.childNodes.length === 1 &&
        element.firstChild.nodeName === 'BR') return '';
    let text = element.innerText || element.textContent;
    // Firefox appends a <br> to the end of contenteditable
    if (isFirefox) text = text.replace(/\n$/, '');
    return text;
  },

  input() {
    const text = this.getElementText();
    this.setBlockPlaceholderFromInput(text);
    if (!this.get('usesMarkdown')) return;
    if (isFirefox) return;
    this.get('selectionState').capture();
    this.renderBlockContent();
    this.get('selectionState').restore();
  },

  paste(evt) {
    evt.preventDefault();
    const text = evt.originalEvent.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  },

  linkifyLinks() {
    this.$('.md-url').each(function() {
      Ember.$(this).wrap(`<a href="${this.textContent}">`);
    });

    this.$('.md-link').each(function() {
      const href = Ember.$(this).find('.md-href').text();
      Ember.$(this).wrap(`<a href="${href}">`);
    });
  },

  renderBlockContent: observer('block.meta.placeholder', on('didInsertElement',
    function renderBlockContent() {
      if (this.get('isUpdatingBlockPlaceholder')) return;

      const placeholder = this.getWithDefault('block.meta.placeholder', '');

      if (!placeholder) {
        this.$().html('<br>');
        return;
      }

      if (!isFirefox && this.get('usesMarkdown')) {
        const html = highlight(placeholder);
        this.$().html(html);
        this.linkifyLinks();
      } else {
        this.$().text(placeholder);
      }
    })),

  setBlockPlaceholderFromInput(placeholder, preventRerender = true) {
    if (preventRerender) { this.set('isUpdatingBlockPlaceholder', true); }
    const oldValue = this.get('block.meta.placeholder');
    this.set('block.meta.placeholder', placeholder);
    if (preventRerender) { this.set('isUpdatingBlockPlaceholder', false); }
    this.get('onBlockMetaReplacedLocally')(
      this.get('block'),
      ['placeholder'],
      oldValue,
      this.get('block.meta.placeholder'));
  }
});
