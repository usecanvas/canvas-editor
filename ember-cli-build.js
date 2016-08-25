/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    // Add options here
  });

  app.import(`${app.bowerDirectory}/base62/base62.min.js`);
  app.import(`${app.bowerDirectory}/uuid.js/src/uuid.js`);
  app.import('vendor/shims/base62.js');
  app.import('vendor/shims/uuid.js');

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
