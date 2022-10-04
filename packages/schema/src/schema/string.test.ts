import StringSchema from './string'

const $string = new StringSchema()

describe('validate()', () => {

    it('validates string values', () => {
        expect($string.validate('hello'))
            .toEqual('hello')

        expect(() => $string.validate(true))
            .toThrow('true is not string')
    })

    it('casts numbers to strings', () => {
        for (const number of [0, 100, 1000, Infinity]) {
            expect($string.validate(number))
                .toEqual(number.toString())
        }
    })

    it('casts arrays to joined strings', () => {
        expect($string.validate([0, 1, 2, 3, 4]))
            .toEqual('0,1,2,3,4')
    })
})

describe('default()', () => {

    it('input can be used as default', () => {
        const $defaultStr = new StringSchema('hello')
        expect($defaultStr.validate(undefined)).toEqual('hello')
    })

    it('respects default setting, if valid', () => {
        expect($string.default('str').validate(undefined)).toEqual('str')
    })

    it('default()s to ""', () => {
        expect($string.default().validate(undefined)).toBe('')
    })

})

describe('trim()', () => {

    it('transforms strings to remove whitespace', () => {
        const $trimmedString = $string
            .trim()
        expect($trimmedString.validate('  ace  '))
            .toEqual('ace')
    })

    it('allows optional error', () => {
        const $trimmedString = $string
            .trim({ error: 'no whitespace allowed' })
        expect(() => $trimmedString.assert('  ace  '))
            .toThrow('no whitespace allowed')
    })
})

describe('format()', () => {

    it('validates that a string is in a given format', () => {
        const $alpha = $string.format('alpha')

        expect($alpha.validate('abc')).toEqual('abc')
        expect(() => $alpha.validate('012')).toThrow('must be formatted as alpha')
    })

    it('allows optional error', () => {
        const $plural = $string.format(/s$/, 'must be pluralized')

        expect($plural.validate('cats')).toEqual('cats')
        expect(() => $plural.validate('cat')).toThrow('must be pluralized')
    })

})

describe('length()', () => {
    it('validates string length', () => {
        const $password = $string.length('>=', 8)
        expect($password.validate('12345678')).toEqual('12345678')
        expect(() => $password.validate('1234')).toThrow('length must be above or equal 8')
    })
})

for (const method of [
    'upperCase', 
    'lowerCase', 
    'pascalCase', 
    'camelCase', 
    'capitalize', 
    'dashCase'
] as const) {

    describe(`${method}()`, () => {

        it(`validates that a string is ${method}`, () => {
            const $cased = $string[method]()

            const errorMsg = 'must be ' + method
                .replace('Case', '')
                .replace('capitalize', 'capital')
                + ' cased'

            expect(() => $cased.assert('oh This is DEF incorrect'))
                .toThrow(errorMsg)
        })

        it('allows optional error', () => {
            const $casedWithError = $string[method]({ error: 'wrong case, asshole' })
            expect(() => $casedWithError.assert('oh This is DEF incorrect'))
                .toThrow('wrong case, asshole')
        })

        it('smart delimeter signatures', () => {

            if (method === 'camelCase' || method === 'pascalCase') {
                $string[method](/_/)
                $string[method]('_')
            } else if (method === 'dashCase') {
                $string[method]('-')
                $string[method]('-', 'error')
                // @ts-expect-error RegEx Should not be allowed
                $string[method](/_/, 'error')
            } else {
                // @ts-expect-error RegEx Should not be allowed
                $string[method](/-/)
                $string[method]('error')
            }
        })
    })
}