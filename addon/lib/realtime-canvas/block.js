import Ember from 'ember';
import Base62UUID from 'canvas-editor/lib/base62-uuid';

const { computed } = Ember;

export default Ember.Object.extend({
  id: computed(_ => Base62UUID.generate()),
  content: computed(_ => []),
  lastContent: computed(_ => []),
});
