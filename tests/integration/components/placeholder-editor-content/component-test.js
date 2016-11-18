import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('placeholder-editor-content',
                   'Integration | Component | placeholder editor content', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{placeholder-editor-content}}`);
  assert.equal(this.$().text().trim(), '');
});
