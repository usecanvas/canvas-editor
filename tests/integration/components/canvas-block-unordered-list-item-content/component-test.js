import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-unordered-list-item-content',
                   'Integration | Component | canvas block unordered list item content', { // eslint-disable-line max-len
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{canvas-block-unordered-list-item-content}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#canvas-block-unordered-list-item-content}}
      template block text
    {{/canvas-block-unordered-list-item-content}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
