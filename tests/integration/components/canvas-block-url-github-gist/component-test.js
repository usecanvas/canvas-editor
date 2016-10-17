import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-url-github-gist',
                   'Integration | Component | canvas block url github gist', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{canvas-block-url-github-gist}}`);
  assert.equal(this.$().text().trim(), '');
});
