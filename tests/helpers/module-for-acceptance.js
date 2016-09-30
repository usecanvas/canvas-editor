import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();

      if (options.beforeEach) {
        return Reflect.apply(options.beforeEach, this, arguments);
      }

      return null;
    },

    afterEach() {
      const afterEach =
        options.afterEach && Reflect.apply(options.afterEach, this, arguments);
      return Promise.resolve(afterEach).then(_ => destroyApp(this.application));
    }
  });
}
