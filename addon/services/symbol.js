import Ember from 'ember';

export default Ember.Service.extend({
  symbols: Ember.computed(_ => ({})),

  updateSymbolDefinition(name, defn) {
    this.set(`symbols.${name}`, defn);
  }
});
