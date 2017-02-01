import Ember from 'ember';
import layout from './template';
import { task } from 'ember-concurrency';

const { computed, observer, on, NativeArray } = Ember;

export default Ember.Component.extend({
  layout,
  /* eslint-disable prefer-reflect */
  results: computed(_ => NativeArray.apply([])),

  setupResults: on('init', 'willDestroyElement', function() {
    this.get('results').setObjects([]);
    this.get('onResolveFilter')([]);
  }),

  onResolveFilter: Ember.K,

  onValueChange: observer('value', function() {
    this.get('handleValueChange').perform(this.get('value'));
  }),

  handleValueChange: task(function *(value) {
    const results = yield this.get('onFilter')(value);
    this.set('results', results);
    this.get('onResolveFilter')(results);
  }).keepLatest()
});
