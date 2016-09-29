import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Helper.extend({
  compute([type]) {
    const componentName = `canvas-block-${type}`;
    const component = getOwner(this).lookup(`component:${componentName}`);
    return component ? componentName : 'canvas-block-unknown';
  }
});
