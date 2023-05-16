module.exports = {

    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    },

    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier'
    ],

    // TODO turn this into a preset and put it in @benzed/dev
    rules: {
        '@typescript-eslint/ban-types': ['error', {
            types: {
                "{}": false,
                "Function": false
            }
        }],
        '@typescript-eslint/prefer-optional-chain': ['warn'],
        '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
        '@typescript-eslint/prefer-readonly': ['error'],
        '@typescript-eslint/restrict-plus-operands': 'off', // this rule seems to frequently break
        '@typescript-eslint/no-unused-expressions': ['error', { allowTaggedTemplates: true }],
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'all', argsIgnorePattern: '^_' }],
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/unified-signatures': 'off',
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/no-this-alias': 'off', // I don't have a problem with 'this' aliasing.
        '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
        '@typescript-eslint/explicit-function-return-type': ['off', { allowExpressions: true }],

    }
}
