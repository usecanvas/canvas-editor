import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-template-settings',
                   'Integration | Component | canvas block template settings', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{canvas-block-template-settings}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#canvas-block-template-settings}}
      template block text
    {{/canvas-block-template-settings}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
