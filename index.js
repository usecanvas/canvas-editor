/* eslint-env node */

'use strict';

const autoprefixer = require('autoprefixer');
const customProperties = require('postcss-custom-properties');
const postcssNested = require('postcss-nested');

module.exports = {
  name: 'canvas-editor',

  options: {
    cssModules: {
      plugins: {
        before: [
          postcssNested,
          customProperties({ preserve: true })
        ],
        after: [
          autoprefixer('last 2 versions')
        ]
      }
    }
  },

  isDevelopingAddon() {
    return process.env.NODE_ENV !== 'production';
  },

  included(app) {
    this._super.included.call(this, app);

    app.import(`${app.bowerDirectory}/base62/base62.min.js`);
    app.import(`${app.bowerDirectory}/rangy/rangy-core.js`);
    app.import(`${app.bowerDirectory}/rangy/rangy-textrange.js`);
    app.import(`${app.bowerDirectory}/uuid.js/src/uuid.js`);
    app.import('vendor/normalize.css');
    app.import('vendor/shims/base62.js');
    app.import('vendor/shims/rangy.js');
    app.import('vendor/shims/uuid.js');
    app.import('vendor/runkit.js');
    app.import('vendor/shims/runkit.js');
    app.import('vendor/shims/highlight.js');
    app.import('vendor/highlight.js');
  }
};
