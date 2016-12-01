import Ember from 'ember';
import TypeChangesMixin from 'canvas-editor/mixins/type-changes';
import { module, test } from 'qunit';

module('Unit | Mixin | type changes');

// Replace this with your real tests.
test('it works', function(assert) {
  const TypeChangesObject = Ember.Object.extend(TypeChangesMixin);
  const subject = TypeChangesObject.create();
  assert.ok(subject);
});
