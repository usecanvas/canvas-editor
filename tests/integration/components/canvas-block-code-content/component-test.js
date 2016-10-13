import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-code-content',
                   'Integration | Component | canvas block code content', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('block', Ember.Object.create({ content: 'foo' }));
  this.render(hbs`{{canvas-block-code-content block=block}}`);
  assert.equal(this.$().text().trim(), 'foo');
});
