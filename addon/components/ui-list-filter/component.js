import Ember from 'ember';
import layout from './template';

const { observer } = Ember;

export default Ember.Component.extend({
  layout,

  onValueChange: observer('value', function() {
    const value = this.get('value');
    this.get('onFilter')(value).then(results => this.set('results', results));
  })
});
