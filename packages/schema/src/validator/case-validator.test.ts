import CaseValidator from './case-validator'

describe.only('case attribute sanitizier', () => {

    it('creates a case sanitizer function', () => {

        const toUpperCase = new CaseValidator({
            case: 'upper'
        })

        expect(toUpperCase.validate('hey', true))
            .toEqual('HEY')
    })

    describe('casing options', () => {

        for (const { casing, input, output } of [
            { casing: 'upper', input: 'foobar', output: 'FOOBAR' },
            { casing: 'lower', input: 'FOOBAR', output: 'foobar' },
            { casing: 'capital', input: 'fooBar', output: 'FooBar' },
            { casing: 'dash', input: 'foo bar', output: 'foo-bar' },
            { casing: 'dash', input: 'foo_bar', output: 'foo-bar' },
            { casing: 'dash', input: 'FooBar', output: 'foo-bar' },
            { casing: 'camel', input: 'foo bar', output: 'fooBar' },
            { casing: 'camel', input: 'foo-bar', output: 'fooBar' },
            { casing: 'camel', input: 'foo_bar', output: 'fooBar' },
            { casing: 'pascal', input: 'foo-bar', output: 'FooBar' },
            { casing: 'pascal', input: 'foo bar', output: 'FooBar' },
            { casing: 'pascal', input: 'foo bar', output: 'FooBar' },
            { casing: 'pascal', input: 'foo_bar', output: 'FooBar' },
        ] as const) {

            it(`${casing} "${input}" -> "${output}"`, () => {

                const toCase = new CaseValidator({
                    case: casing,
                })

                expect(toCase.validate(input, true))
                    .toEqual(output)

                expect(() => toCase.validate(input, false))
                    .toThrow(`must be ${casing} case`)
            })
        }
    })

    const toSnakeCase = new CaseValidator({
        case: 'dash',
        delimiter: '_',
        error: (input) => `"${input}" must be in snake_case`
    })

    it('allows a custom string delimiter for dash case', () => {
        expect(toSnakeCase.validate('fooBar', true))
            .toEqual('foo_bar')

        // @ts-expect-error RegExp delimeters not allowed
        toSnakeCase.applySettings({ delimiter: /-/ })
    })

    for (const casing of ['pascal', 'camel'] as const) {
        it(`allows a custom string or regexp delimiter for ${casing} case`, () => {
            const fromAtCase = new CaseValidator({
                case: casing,
                delimiter: /@/
            })

            expect(fromAtCase.validate('Foo@bar', true)).toEqual('FooBar')
        })
    }

    it('allows custom error message', () => {
        expect(() => toSnakeCase.validate('no way man', false))
            .toThrow('must be in snake_case')
    })

})