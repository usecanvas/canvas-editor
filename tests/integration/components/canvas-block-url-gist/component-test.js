import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-url-gist', 'Integration | Component | canvas block url gist', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{canvas-block-url-gist}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#canvas-block-url-gist}}
      template block text
    {{/canvas-block-url-gist}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
