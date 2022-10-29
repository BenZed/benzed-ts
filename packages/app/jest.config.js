
module.exports = {

    roots: [
        `./src`,
        `./test`
    ],

    transform: {
        '^.+\\.tsx?$': [
            `ts-jest`,
            {
                tsconfig: `../../tsconfig.test.json`
            }
        ]
    },

    modulePathIgnorePatterns: [
        `util.test.ts`,
    ]

}