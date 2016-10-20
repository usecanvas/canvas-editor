import Ember from 'ember';
import layout from './template';

const { observer, on } = Ember;

export default Ember.Component.extend({
  layout,

  setupResults: on('init', function() {
    this.set('results', []);
    this.get('onResolveFilter')([]);
  }),

  teardownResults: on('willDestroyElement', function() {
    this.set('results', []);
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
