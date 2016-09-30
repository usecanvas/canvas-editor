import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-checklist-item',
                   'Integration | Component | canvas block checklist item', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{canvas-block-checklist-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#canvas-block-checklist-item}}
      template block text
    {{/canvas-block-checklist-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
