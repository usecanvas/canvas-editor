import Ember from 'ember';

export function blockComponentName([block]/*, hash*/) {
  return `canvas-block-${block.get('type')}`;
}

export default Ember.Helper.helper(blockComponentName);
