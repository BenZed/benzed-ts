
const BEFORE_ALL_TESTS = './test/all-before.test.ts'
const AFTER_ALL_TESTS = './test/all-after.test.ts'

module.exports = {

    roots: [
        './src',
        './test'
    ],

    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '../../tsconfig.test.json',
            }
        ]
    },

    globalSetup: BEFORE_ALL_TESTS,
    globalTeardown: AFTER_ALL_TESTS,

    modulePathIgnorePatterns: [
        BEFORE_ALL_TESTS,
        AFTER_ALL_TESTS,
        'util.test.ts',
        '_old*'
    ]

}
