import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-unknown',
                   'Integration | Component | canvas block unknown', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{canvas-block-unknown}}`);
  assert.equal(this.$().text().trim(),
    'Whoops! We don\'t recognize this type of block.');
});
