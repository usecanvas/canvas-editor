import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-template-settings',
                   'Integration | Component | canvas block template settings', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{canvas-block-template-settings}}`);
  assert.equal(this.$().text().trim(), 'Use as placeholder');
});
