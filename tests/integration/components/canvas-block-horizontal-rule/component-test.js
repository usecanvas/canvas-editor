import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-horizontal-rule',
                   'Integration | Component | canvas block horizontal rule', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{canvas-block-horizontal-rule}}`);
  assert.equal(this.$().text().trim(), '');
});
