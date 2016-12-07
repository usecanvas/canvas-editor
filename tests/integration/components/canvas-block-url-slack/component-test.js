import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-url-slack',
                   'Integration | Component | canvas block url slack', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{canvas-block-url-slack}}`);
  assert.equal(this.$().text().trim(), '');
});
