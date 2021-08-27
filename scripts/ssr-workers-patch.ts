/**
 * https://github.com/vercel/next.js/issues/22581
 * https://github.com/vercel/next.js/issues/22581#issuecomment-864476385
 */
import SSRPlugin from "next/dist/build/webpack/plugins/nextjs-ssr-import";
import webpack from 'webpack';
import path from 'path';

export default function applySsrWorkersPatch(config: webpack.Configuration) {
  const ssrPlugin = config.plugins?.find(plugin => plugin instanceof SSRPlugin);
  if (ssrPlugin) {
    patchSsrPlugin(ssrPlugin);
  }
}

// Unfortunately there isn't an easy way to override the replacement function body, so we 
// have to just replace the whole plugin `apply` body.
function patchSsrPlugin(plugin: webpack.WebpackPluginInstance) {
  plugin.apply = function apply(compiler) {
    compiler.hooks.compilation.tap("NextJsSSRImport", compilation => {
      compilation.mainTemplate.hooks.requireEnsure.tap(
        "NextJsSSRImport",
        (code, chunk) => {
          // This is the block that fixes https://github.com/vercel/next.js/issues/22581
          if (!chunk.name) {
            return undefined as any;
          }

          // Update to load chunks from our custom chunks directory
          const outputPath = path.resolve("/");
          const pagePath = path.join("/", path.dirname(chunk.name));
          const relativePathToBaseDir = path.relative(pagePath, outputPath);
          // Make sure even in windows, the path looks like in unix
          // Node.js require system will convert it accordingly
          const relativePathToBaseDirNormalized = relativePathToBaseDir.replace(
            /\\/g,
            "/"
          );
          return code
            .replace(
              'require("./"',
              `require("${relativePathToBaseDirNormalized}/"`
            )
            .replace(
              "readFile(join(__dirname",
              `readFile(join(__dirname, "${relativePathToBaseDirNormalized}"`
            );
        }
      );
    });
  };
}
