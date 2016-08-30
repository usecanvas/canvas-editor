/* eslint-env node */

'use strict';

module.exports = {
  name: 'canvas-editor',

  isDevelopingAddon() {
    return process.env.NODE_ENV !== 'production';
  },

  options: {
    cssModules: {
      plugins: {
        before: [
          require('postcss-nested')
        ],
        after: [
          require('postcss-import'),
          require('postcss-css-variables'),
          require('postcss-calc'),
          require('postcss-custom-media')
        ],
      },
    }
  },

  included(app) {
    this._super.included.call(this, app);

    app.import(`${app.bowerDirectory}/base62/base62.min.js`);
    app.import(`${app.bowerDirectory}/rangy/rangy-core.js`);
    app.import(`${app.bowerDirectory}/rangy/rangy-textrange.js`);
    app.import(`${app.bowerDirectory}/uuid.js/src/uuid.js`);
    app.import('vendor/shims/base62.js');
    app.import('vendor/shims/rangy.js');
    app.import('vendor/shims/uuid.js');
  }
};
