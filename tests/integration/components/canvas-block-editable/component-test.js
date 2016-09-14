import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-content', 'Integration | Component | canvas block editable', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{canvas-block-content}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#canvas-block-content}}
      template block text
    {{/canvas-block-content}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
