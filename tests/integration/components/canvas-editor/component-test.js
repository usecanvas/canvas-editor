import { moduleForComponent, test } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';
import CLItem from 'canvas-editor/lib/realtime-canvas/checklist-item';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import Heading from 'canvas-editor/lib/realtime-canvas/heading';
import HorizontalRule from 'canvas-editor/lib/realtime-canvas/horizontal-rule';
import Image from 'canvas-editor/lib/realtime-canvas/image';
import List from 'canvas-editor/lib/realtime-canvas/list';
import Paragraph from 'canvas-editor/lib/realtime-canvas/paragraph';
import RealtimeCanvas from 'canvas-editor/lib/realtime-canvas';
import Title from 'canvas-editor/lib/realtime-canvas/title';
import ULItem from 'canvas-editor/lib/realtime-canvas/unordered-list-item';
import URLCard from 'canvas-editor/lib/realtime-canvas/url-card';

moduleForComponent('canvas-editor', 'Integration | Component | canvas editor', {
  integration: true
});

test('it renders', function(assert) {
  const canvas = RealtimeCanvas.create({
    /* eslint-disable max-len */
    blocks: Ember.A([
      Title.create({ content: 'Every Element' }),
      Paragraph.create({ content: 'This is a Canvas that has every element. This lets us test that we haven\'t screwed up any of the basic layout through visual regression testing:' }),
      List.create({
        blocks: Ember.A([
          ULItem.create({ content: 'List item A' }),
          ULItem.create({ content: 'List item B', meta: { level: 2 } }),
          ULItem.create({ content: 'List item C' }),
          CLItem.create({ content: 'List item D', meta: { checked: true } }),
          CLItem.create({ content: 'List item E', meta: { checked: false, level: 2 } }),
          ULItem.create({ content: 'List item F' })
        ])
      }),
      HorizontalRule.create(),
      Paragraph.create({ content: 'A short paragraph to break things up' }),
      Image.create({
        meta: {
          url: 'https://cloud.githubusercontent.com/assets/111631/19365950/035de456-914a-11e6-9f21-34d11c0b1db2.png'
        }
      }),
      Heading.create({ content: 'Level 1 Heading', meta: { level: 1 } }),
      Heading.create({ content: 'Level 2 Heading', meta: { level: 2 } }),
      Heading.create({ content: 'Level 3 Heading', meta: { level: 3 } }),
      Heading.create({ content: 'Level 4 Heading', meta: { level: 4 } }),
      Heading.create({ content: 'Level 5 Heading', meta: { level: 5 } }),
      Heading.create({ content: 'Level 6 Heading', meta: { level: 6 } }),
      Paragraph.create({ content: 'A short paragraph to break things up' }),
      Paragraph.create({ content: 'Just to throw things in here there is a card. We don\'t really want to test that the card inners are the same but that the spacing around the card is consistent:' }),
      URLCard.create({ meta: { url: 'http://example.com' } }),
      Heading.create({ content: 'Another level 2 Heading', meta: { level: 2 } }),
      Heading.create({ content: 'Another level 3 Heading', meta: { level: 3 } }),
      Heading.create({ content: 'Another level 4 Heading', meta: { level: 4 } })
    ])
    /* eslint-enable max-len */
  });

  this.set('canvas', canvas);

  this.render(hbs`{{canvas-editor-next canvas=canvas}}`);
  percySnapshot(assert);

  assert.ok(this.$().text()
    .includes('This is a Canvas that has every element.'));
  assert.ok(this.$().text().includes('break things up'));
  assert.ok(this.$().text().includes('Another level 4 Heading'));
});
