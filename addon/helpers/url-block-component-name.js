import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Helper.extend({
  compute([providerName]) {
    const componentPrefix = 'canvas-block-url';

    if (!providerName) {
      return `${componentPrefix}-default`;
    }

    const providerNameSlug = Ember.String.dasherize(providerName.toLowerCase());
    const componentName = `${componentPrefix}-${providerNameSlug}`;

    const component = getOwner(this).lookup(`component:${componentName}`);
    return component ? componentName : `${componentPrefix}-default`;
  }
});
