const BEFORE_ALL_TESTS = './src/all-before.test.ts'
const AFTER_ALL_TESTS = './src/all-after.test.ts'

module.exports = {

    roots: [
        './src'
    ],

    transform: {
        '^.+\\\.tsx?$': 'ts-jest'
    },

    globals: {
        'ts-jest': {
            tsconfig: '../../tsconfig.test.json'
        }
    },
    globalSetup: BEFORE_ALL_TESTS,
    globalTeardown: AFTER_ALL_TESTS,

    modulePathIgnorePatterns: [
        BEFORE_ALL_TESTS,
        AFTER_ALL_TESTS,
        'util.test.ts'
    ]
}