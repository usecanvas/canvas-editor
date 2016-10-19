import { moduleForComponent, test } from 'ember-qunit';
import Block from 'canvas-editor/lib/realtime-canvas/block';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-url',
                   'Integration | Component | canvas block url', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('block', Block.create());
  this.render(hbs`{{canvas-block-url block=block}}`);
  assert.equal(this.$().text().trim(), '');
});
