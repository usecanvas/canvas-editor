import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('placeholder-editor',
                   'Integration | Component | placeholder editor', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{placeholder-editor}}`);
  assert.equal(this.$().text().trim(), 'Done');
});
