module.exports = {

    parser: '@typescript-eslint/parser',

    plugins: ['@typescript-eslint'],

    extends: [
        'plugin:@typescript-eslint/recommended'
    ],

    rules: {
        quotes: ['error', 'single'],
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        'no-multiple-empty-lines': ['error'],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }]
    }

}
