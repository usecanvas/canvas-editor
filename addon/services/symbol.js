import Ember from 'ember';
import { parseSymbolDefinition } from 'canvas-editor/lib/symbol/parser';

export default Ember.Service.extend({
  symbols: Ember.computed(_ => ({})),
  updateSymbolDefinition(name, defn) {
    this.set(`symbols.${name}`, defn);
  }
});
