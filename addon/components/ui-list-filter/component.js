import Ember from 'ember';
import layout from './template';

const { computed, observer, on } = Ember;

export default Ember.Component.extend({
  layout,
  results: computed(_ => []),

  setupResults: on('init', 'willDestroyElement', function() {
    this.get('results').setObjects([]);
    this.get('onResolveFilter')([]);
  }),

  onResolveFilter: Ember.K,

  onValueChange: observer('value', function() {
    const value = this.get('value');
    this.get('onFilter')(value).then(results => {
      this.set('results', results);
      this.get('onResolveFilter')(results);
    });
  })
});
