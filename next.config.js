const path = require('path')

module.exports = {
  webpack (config, _options) {
    /**
     * Add path aliases.
     */
    Object.assign(config.resolve.alias, {
      '@components': path.join(__dirname, 'components'),
      '@model': path.join(__dirname, 'model'),
      '@store': path.join(__dirname, 'store')
    });
    return config;
  }
}
