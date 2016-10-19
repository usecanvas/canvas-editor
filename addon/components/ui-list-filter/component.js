import Ember from 'ember';
import layout from './template';

const { observer, on } = Ember;

export default Ember.Component.extend({
  layout,

  onResolveFilter: Ember.K,

  onValueChange: observer('value', function() {
    const value = this.get('value');
    this.get('onFilter')(value).then(results => {
      this.set('results', results);
      this.get('onResolveFilter')(results);
    });
  })
});
