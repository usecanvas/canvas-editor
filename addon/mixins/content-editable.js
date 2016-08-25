import Ember from 'ember';

const { observer, on } = Ember;

/**
 * A mixin for including text content in a canvas that is user-editable.
 *
 * @class CanvasEditor.ContentEditableMixin
 * @extends Ember.Mixin
 */
export default Ember.Mixin.create({
  attributeBindings: ['contentEditable:contenteditable'],
  contentEditable: true,
  isUpdatingBlockContent: false,

  /**
   * React to an "input" event, where the user has changed content in the DOM.
   *
   * @method
   */
  input() {
    /*
     * Wrap in `isUpdatingBlockContent = true` to prevent Ember rendering after
     * we set "content".
     */
    this.set('isUpdatingBlockContent', true);
    this.set('block.lastContent', this.get('block.content'));
    this.get('block.content').replace(0, 1, [this.$().text()]);
    this.set('isUpdatingBlockContent', false);
    this.blockContentUpdatedLocally();
  },

  /**
   * Render the contents of the associated block.
   *
   * Because contenteditable elements collapse when they have no content, the
   * default content is "<br>". This is not a normal Ember template because
   * editing of text by a user destroys Ember bindings. Instead, we listen for
   * DOM events and update the underlying model based on user changes.
   *
   * @method
   * @observer block.content.[]
   * @on didInsertElement
   */
  renderBlockContent: observer('block.content.[]', on('didInsertElement',
    function renderBlockContent() {
      if (this.get('isUpdatingBlockContent')) return;

      const content = this.get('block.content').join('');

      if (content) {
        this.$().text(content);
      } else {
        this.$().html('<br>');
      }
    }))
});
