import Ember from 'ember';
import layout from './template';
import { task } from 'ember-concurrency';

const { computed, on, A } = Ember;

export default Ember.Component.extend({
  layout,
  /* eslint-disable prefer-reflect */
  results: computed(_ => A([])),

  setupResults: on('init', 'willDestroyElement', function() {
    this.get('results').setObjects([]);
    this.get('onResolveFilter')([]);
  }),

  onResolveFilter() {},

  handleValueChange: task(function *() {
    const value = this.get('value');
    const results = yield this.get('onFilter')(value);
    this.set('results', results);
    this.get('onResolveFilter')(results);
  }).observes('value').keepLatest()
});
