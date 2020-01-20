const path = require('path')

/**
 * Currently needed to load gitalk module's gitalk.css.
 * https://github.com/zeit/next-plugins/tree/master/packages/next-css
 */
const withCSS = require('@zeit/next-css');

/**
 * Used to load pngs.
 * https://github.com/twopluszero/next-images
 */
const withImages = require('next-images');

/**
 * MDX support.
 * https://github.com/zeit/next.js/tree/master/packages/next-mdx
 */
const withMDX = require('@next/mdx')()

module.exports =
  withMDX(
  withImages(
  withCSS({
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
        '@assets': path.join(__dirname, 'assets'),
        '@env': path.join(__dirname, 'env'),
      });
      return config;
    },

    exportPathMap: function () {
      return {
        '/': { page: '/' }
      };
    }
  }
)))
