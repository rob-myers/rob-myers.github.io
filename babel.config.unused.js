"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (api) => {
    api.cache(true);
    return {
        exclude: [],
        presets: [
            [
                'next/babel',
                {
                    'preset-env': {
                        targets: {
                            esmodules: true,
                        },
                    },
                    'preset-react': {
                        runtime: 'automatic',
                    },
                    // https://github.com/babel/babel/issues/11539#issuecomment-626381058
                    // 'transform-runtime': {},
                    // 'styled-jsx': {},
                    // 'class-properties': {},
                },
            ],
        ],
        plugins: [],
    };
};
