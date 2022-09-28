module.exports = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
    modulePathIgnorePatterns: [
        'util.test.ts'
    ]
}