import { moduleForComponent, test } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-progress-donut',
                   'Integration | Component | ui progress donut', {
  integration: true
});

test('should show progress', function(assert) {
  this.set('progress', 25);
  this.render(hbs`{{ui-progress-donut progress=progress}}`);
  percySnapshot('ui-progress-donut at 25');

  this.set('progress', 75);
  percySnapshot('ui-progress-donut at 75');

  this.set('progress', 0);
  percySnapshot('ui-progress-donut at 0');

  this.set('progress', 100);
  percySnapshot('ui-progress-donut at 100');

  assert.equal(this.$().text().trim(), '');
});
