import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-tip-content',
                   'Integration | Component | canvas block tip content', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{canvas-block-tip-content}}`);
  assert.equal(this.$().text().trim(), '');
});
