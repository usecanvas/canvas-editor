import { module, test } from 'qunit';
import ChecklistItem from 'canvas-editor/lib/realtime-canvas/checklist-item';

module('Unit | lib | RealtimeCanvas | ChecklistItem');

test('.createFromMarkdown (checked)', function(assert) {
  const block = ChecklistItem.createFromMarkdown('- [x] Item', {});
  assert.equal(block.get('content'), 'Item');
  assert.equal(block.get('meta.checked'), true);
});

test('.createFromMarkdown (unchecked)', function(assert) {
  const block = ChecklistItem.createFromMarkdown('- [ ] Item', {});
  assert.equal(block.get('content'), 'Item');
  assert.equal(block.get('meta.checked'), false);
});
