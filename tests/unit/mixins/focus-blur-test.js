import Ember from 'ember';
import FocusBlurMixin from 'canvas-editor/mixins/focus-blur';
import { module, test } from 'qunit';

module('Unit | Mixin | focus blur');

// Replace this with your real tests.
test('it works', function(assert) {
  const FocusBlurObject = Ember.Object.extend(FocusBlurMixin);
  const subject = FocusBlurObject.create();
  assert.ok(subject);
});
