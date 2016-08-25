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

  /**
   * Render the contents of the associated block.
   *
   * Because contenteditable elements collapse when they have no content, the
   * default content is "<br>". This is not a normal Ember template because
   * editing of text by a user destroys Ember bindings. Instead, we listen for
   * DOM events and update the underlying model based on user changes.
   *
   * @method
   * @on didInsertElement
   */
  renderBlockContent: on('didInsertElement', function renderBlockContent() {
    const content = this.get('block.content').join('');

    if (content) {
      this.$().text(content);
    } else {
      this.$().html('<br>');
    }
  })
});
