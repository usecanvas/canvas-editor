import Ember from 'ember';

const { computed } = Ember;

export default Ember.Object.extend({
  content: computed(_ => [])
});
