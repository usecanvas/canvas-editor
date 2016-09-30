import Ember from 'ember';
import BlockEventsMixin from 'canvas-editor/mixins/block-events';
import { module, test } from 'qunit';

module('Unit | Mixin | block events');

// Replace this with your real tests.
test('it works', function(assert) {
  const BlockEventsObject = Ember.Object.extend(BlockEventsMixin);
  const subject = BlockEventsObject.create();
  assert.ok(subject);
});
