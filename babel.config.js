module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "@babel/react",
      "@babel/typescript", [
        "@babel/env",
        { "modules": false },
      ],
    ],
    plugins: [
      "react-hot-loader/babel",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-transform-runtime",
      "@babel/plugin-transform-typescript",
    ],
  };
}
