import { moduleForComponent, test } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-editor', 'Integration | Component | canvas editor', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{canvas-editor}}`);
  percySnapshot('sample screenshot');
  assert.equal(this.$().text().trim(), '');
});
