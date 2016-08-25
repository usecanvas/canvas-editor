import Ember from 'ember';

export default Ember.Component.extend({
  attributeBindings: ['block.id:data-block-id'],
  classNames: ['canvas-block-paragraph']
});
