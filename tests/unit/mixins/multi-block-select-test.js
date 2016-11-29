import Ember from 'ember';
import MultiBlockSelectMixin from 'canvas-editor/mixins/multi-block-select';
import { module, test } from 'qunit';

module('Unit | Mixin | multi block select');

// Replace this with your real tests.
test('it works', function(assert) {
  const MultiBlockSelectObject = Ember.Object.extend(MultiBlockSelectMixin);
  const subject = MultiBlockSelectObject.create();
  assert.ok(subject);
});
