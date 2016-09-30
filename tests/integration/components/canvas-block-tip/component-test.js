import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-tip',
                   'Integration | Component | canvas block tip', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{canvas-block-tip}}`);
  assert.ok(/Pro Tip/.test(this.$().text()));
});
