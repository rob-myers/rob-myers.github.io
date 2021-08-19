module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "no-unused-vars": [
            "error",
            {
                "varsIgnorePattern": "^_",
                "argsIgnorePattern": "^_"
            }
        ],
    },
    "overrides": [
        {
            "files": [".eslintrc.js"],
            "rules": {
                "no-undef": "off"
            }
        },
        {
            "files": ["projects/**/*.js", "projects/**/*.jsx"],
            "rules": {
                "no-unused-vars": "off"
            }
        }
    ]
};
