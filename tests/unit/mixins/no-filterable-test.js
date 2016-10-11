import Ember from 'ember';
import NoFilterableMixin from 'canvas-editor/mixins/no-filterable';
import { module, test } from 'qunit';

module('Unit | Mixin | no filterable');

// Replace this with your real tests.
test('it works', function(assert) {
  const NoFilterableObject = Ember.Object.extend(NoFilterableMixin);
  const subject = NoFilterableObject.create();
  assert.ok(subject);
});
