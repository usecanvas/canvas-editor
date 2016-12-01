import Ember from 'ember';

/**
 * @module
 */

/**
 * @function
 * @param {string} eventName The name of the event to namespace
 * @param {object} object The object to namespace the event to
 * @returns {string} The namespaced event
 */
export default function nsEvent(eventName, object) {
  return `${eventName}.${Ember.guidFor(object)}`;
}
