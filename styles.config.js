"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extract_css_chunks_webpack_plugin_1 = __importDefault(require("extract-css-chunks-webpack-plugin"));
const optimize_css_assets_webpack_plugin_1 = __importDefault(require("optimize-css-assets-webpack-plugin"));
function default_1({ isServer, dev, defaultLoaders, }) {
    const cssLoader = ({ useModules }) => ({
        loader: 'css-loader',
        options: {
            modules: useModules ? {
                localIdentName: dev ? '[name]__[local]' : '[hash:base64]',
            } : false,
            sourceMap: dev,
            // importLoaders: 2, // 'postcss-loader' and 'sass-loader'
            importLoaders: 1,
            onlyLocals: isServer,
            localsConvention: 'camelCase',
        },
    });
    const styleLoader = {
        loader: 'style-loader',
        options: { injectType: 'singletonStyleTag' },
    };
    const eccLoader = {
        loader: extract_css_chunks_webpack_plugin_1.default.loader,
        options: {
            hmr: dev,
        },
    };
    defaultLoaders.npmCss = [
        ...(!isServer && !dev ? [eccLoader] : []),
        ...(!isServer && dev ? [styleLoader] : []),
        cssLoader({ useModules: false }),
    ];
    return Object.assign(Object.assign({}, (!dev && {
        optimization: {
            minimizer: [
                new optimize_css_assets_webpack_plugin_1.default({
                    cssProcessorOptions: {
                        discardComments: { removeAll: true }
                    }
                })
            ]
        }
    })), { module: {
            rules: [
                {
                    test: /node_modules.+\.css$/,
                    use: defaultLoaders.npmCss
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    use: [
                        {
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 8192,
                                fallback: require.resolve('file-loader'),
                                publicPath: `${''}/_next/static/chunks/fonts/`,
                                outputPath: `${isServer ? '../' : ''}static/chunks/fonts/`,
                                name: '[name]-[hash].[ext]'
                            }
                        }
                    ]
                },
            ],
        } });
}
exports.default = default_1;
