module.exports = {

    parser: '@typescript-eslint/parser',

    plugins: ['@typescript-eslint'],

    extends: [
        'plugin:@typescript-eslint/recommended'
    ],

    rules: {
        quotes: ['error', 'single'],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }]
    }

}
