import Ember from 'ember';

/**
 * @module BlockComponentName
 */

/**
 * @function
 * @param {Array.<object>} params A list of parameters passed, including a
 *   single block
 * @returns {string} The name of a component for this block.
 */
export function blockComponentName([type]/*, hash*/) {
  return `canvas-block-${type}`;
}

export default Ember.Helper.helper(blockComponentName);
