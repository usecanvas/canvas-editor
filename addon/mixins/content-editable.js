import Ember from 'ember';

const { on } = Ember;

/**
 * A mixin for including text content in a canvas that is user-editable.
 *
 * @class CanvasEditor.ContentEditableMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  attributeBindings: ['contentEditable:contenteditable'],
  contentEditable: true,

  renderBlockContent: on('didInsertElement', function renderBlockContent() {
    const content = this.get('block.content').join('');

    if (content) {
      this.$().text(content);
    } else {
      this.$().html('<br>');
    }
  })
});
