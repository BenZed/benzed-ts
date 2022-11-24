module.exports = {
    
    roots: [
        './src'
    ],
    
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '../../tsconfig.test.json'
            }
        ]
    },

    modulePathIgnorePatterns: [
        'util.test.ts'
    ]

}