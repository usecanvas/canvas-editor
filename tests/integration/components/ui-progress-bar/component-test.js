import { moduleForComponent, test } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-progress-bar',
                   'Integration | Component | ui progress bar', {
  integration: true
});

test('it renders', function(assert) {
  this.set('progress', 25);
  this.render(hbs`{{ui-progress-bar progress=progress}}`);
  percySnapshot('ui-progress-bar at 25');

  this.set('progress', 75);
  percySnapshot('ui-progress-bar at 75');

  this.set('progress', 0);
  percySnapshot('ui-progress-bar at 0');

  this.set('progress', 100);
  percySnapshot('ui-progress-bar at 100');

  assert.equal(this.$().text().trim(), '');
});
