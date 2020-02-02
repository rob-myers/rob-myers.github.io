"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (api) => {
    api.cache(true);
    return {
        presets: [
            [
                'next/babel',
                {
                    'preset-env': {},
                    'transform-runtime': {},
                    'styled-jsx': {},
                    'class-properties': {}
                },
            ],
        ],
        plugins: [
            'react-hot-loader/babel'
        ]
    };
};
