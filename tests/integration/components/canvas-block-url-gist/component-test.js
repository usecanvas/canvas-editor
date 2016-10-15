import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-url-gist',
                   'Integration | Component | canvas block url gist', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{canvas-block-url-gist}}`);
  assert.equal(this.$().text().trim(), '');
});
