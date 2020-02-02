"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_merge_1 = __importDefault(require("webpack-merge"));
const path_1 = __importDefault(require("path"));
exports.default = (_phase, _opts) => {
    return {
        webpack: (config) => webpack_merge_1.default(config, {
            resolve: {
                alias: {
                    '@components': path_1.default.resolve(__dirname, 'components'),
                    'react-dom': '@hot-loader/react-dom'
                }
            }
        })
    };
};
