"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_merge_1 = __importDefault(require("webpack-merge"));
const path_1 = __importDefault(require("path"));
const production = process.env.NODE_ENV === 'production';
console.log({ production });
exports.default = (_phase, _opts) => {
    return {
        webpack: (config) => webpack_merge_1.default(config, {
            resolve: {
                alias: Object.assign({ '@components': path_1.default.resolve(__dirname, 'components'), '@store': path_1.default.resolve(__dirname, 'store') }, (!production && { 'react-dom': '@hot-loader/react-dom' }))
            }
        })
    };
};
