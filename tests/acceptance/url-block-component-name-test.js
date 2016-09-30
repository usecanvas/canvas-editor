import { test } from 'qunit';
import BlockComponentName from 'dummy/helpers/url-block-component-name';
import Ember from 'ember';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | URL block component name');

test('returns known components', function(assert) {
  const helper = BlockComponentName.create();
  Ember.setOwner(helper, this.application.buildInstance());
  const result = helper.compute(['canvas']);
  assert.equal(result, 'canvas-block-url-canvas');
});

test('returns the unknown component', function(assert) {
  const helper = BlockComponentName.create();
  Ember.setOwner(helper, this.application.buildInstance());
  const result = helper.compute(['foo']);
  assert.equal(result, 'canvas-block-url-default');
});
