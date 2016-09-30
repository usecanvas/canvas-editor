import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-checklist-item-content',
                   'Integration | Component | canvas block checklist item content', { // eslint-disable-line max-len
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{canvas-block-checklist-item-content}}`);
  assert.equal(this.$().text().trim(), '');
});
