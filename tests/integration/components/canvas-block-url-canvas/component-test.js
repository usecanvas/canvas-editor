import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('canvas-block-url-canvas',
                   'Integration | Component | canvas block url canvas', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('unfurled', Ember.Object.create({
    url: 'http://pro.usecanvas.com/teamName/canvasId',
    fields: [{
      title: 'Tasks Complete',
      value: 0
    }, {
      title: 'Tasks Total',
      value: 10
    }]
  }));
  this.render(hbs`{{canvas-block-url-canvas unfurled=unfurled}}`);
  assert.equal(this.$().text().trim(), '');
});
