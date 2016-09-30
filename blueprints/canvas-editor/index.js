/* eslint-env node */

module.exports = {
  normalizeEntityName() {}, // eslint-disable-line no-empty-function

  afterInstall() {
    return this.addBowerPackagesToProject([
      { name: 'uuid.js', target: '3.3.0' },
      { name: 'base62', target: '0.5.0' },
      { name: 'rangy', target: '1.3.0' }
    ]);
  }
};
