import Block from './block';
import Ember from 'ember';

const { computed } = Ember;

export default Block.extend({
  type: 'paragraph',
  content: computed(_ => ['']),
  lastContent: computed(_ => [''])
});
