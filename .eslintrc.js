module.exports = {

    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    },

    plugins: [
        '@typescript-eslint'
    ],

    extends: [
        'plugin:@typescript-eslint/recommended',
    ],

    // TODO turn this into a preset and put it in @benzed/dev
    rules: {
        'require-await': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': ['error', 'always', { null: 'ignore' }],
        'curly': ['error', 'multi-or-nest'],
        'no-multi-spaces': 'warn',
        'no-multiple-empty-lines': ['warn', { max: 1 }],
        'max-len': ['error', 150],
        'nonblock-statement-body-position': ['warn', 'below'],
        'no-return-assign': 'error',
        '@typescript-eslint/brace-style': ['error'],
        '@typescript-eslint/prefer-optional-chain': ['warn'],
        '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
        '@typescript-eslint/prefer-readonly': ['error'],
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/no-extra-parens': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/no-unused-expressions': ['error', { allowTaggedTemplates: true }],
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'all', argsIgnorePattern: '^_' }],
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/unified-signatures': 'off',
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
        '@typescript-eslint/restrict-plus-operands': 'off', // this rule seems to frequently break
        '@typescript-eslint/member-delimiter-style': ['error', {
            'multiline': {
                'delimiter': 'none',
                'requireLast': false
            },
            'singleline': {
                'delimiter': 'comma',
                'requireLast': false
            }
        }]
    }
}
