import Ember from 'ember';
import ContentEditableMixin from 'canvas-editor/mixins/content-editable';
import { module, test } from 'qunit';

module('Unit | Mixin | content editable');

// Replace this with your real tests.
test('it works', function(assert) {
  let ContentEditableObject = Ember.Object.extend(ContentEditableMixin);
  let subject = ContentEditableObject.create();
  assert.ok(subject);
});
