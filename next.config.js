const path = require('path')

// https://github.com/zeit/next-plugins/tree/master/packages/next-css
const withCSS = require('@zeit/next-css');

module.exports = withCSS({
  webpack(config, _options) {
    /**
     * Add path aliases.
     * Also defined in tsconfig.json.
     */
    Object.assign(config.resolve.alias, {
      '@components': path.join(__dirname, 'components'),
      '@model': path.join(__dirname, 'model'),
      '@store': path.join(__dirname, 'store'),
      '@service': path.join(__dirname, 'service'),
      '@env': path.join(__dirname, 'env'),
    });
    return config;
  },

  exportPathMap: function () {
    return {
      '/': { page: '/' }
    };
  }
})
