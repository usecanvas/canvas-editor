import Ember from 'ember';

const { computed } = Ember;

export default Ember.Object.extend({
  blocks: computed(_ => [])
});
