import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Equivalent to TSLint's "no-empty-interface": false
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            // Common TypeScript rules
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'examples/**',
            'out/**',
            'jest.config.js',
            'eslint.config.mjs',
        ],
    }
);
