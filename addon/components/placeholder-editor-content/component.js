import ContentEditable from 'canvas-editor/mixins/content-editable';
import Ember from 'ember';

const { computed } = Ember;

/**
 * A block that represents the content of a placeholder.
 *
 * @class CanvasEditor.PlaceholderEditorContentComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(ContentEditable, {
  usesMarkdown: false,
  editedContent: computed.alias('block.meta.placeholder'),

  /**
   * Focus the placeholder when it is initially rendered.
   *
   * @method
   */
  didInsertElement() {
    this.$().focus();
  },

  /**
   * Ignore the normal click handling of ContentEditable.
   *
   * @method
   */
  click() {},

  /**
   * Only listen for the placeholder toggle keyboard event.
   *
   * @method
   * @param {Event} evt The keydown event fired
   */
  keyDown(evt) {
    switch (evt.originalEvent.key || evt.originalEvent.keyCode) {
    case 'p':
    case 80:
      if (!(evt.metaKey && evt.ctrlKey)) return;
      evt.stopPropagation();
      evt.preventDefault();
      this.toggleProperty('isEditingPlaceholder');
      break;
    }

  },

  /**
   * Rather than setting the block content, update the block meta.
   *
   * @method
   * @override
   * @param {string} placeholder The new placeholder value
   * @param {boolean} preventRerender Whether to prevent rerenders
   */
  setBlockContentFromInput(placeholder, preventRerender = true) {
    if (preventRerender) { this.set('isUpdatingBlockContent', true); }
    const oldValue = this.get('block.meta.placeholder');
    this.set('editedContent', placeholder);
    if (preventRerender) { this.set('isUpdatingBlockContent', false); }
    this.get('onBlockMetaReplacedLocally')(
      this.get('block'),
      ['placeholder'],
      oldValue,
      this.get('editedContent'));
  }
});
