import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['dist/'] },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } }
        },
        plugins: { react, 'react-hooks': hooks },
        rules: {
            ...hooks.configs.recommended.rules,
            'react/jsx-uses-vars': 'error',
            curly: ['error', 'all']
        }
    }
];
