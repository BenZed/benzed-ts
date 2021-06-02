import { Validator } from '../type'
import createCaseSanitizer from './case'

describe('case attribute sanitizier', () => {

    it('creates a case sanitizer function', () => {

        const toUpperCase = createCaseSanitizer({
            casing: 'upper'
        }) as Validator<string>

        expect(toUpperCase('hey')).toEqual('HEY')
    })

    describe('casing options', () => {

        for (const { casing, input, output } of [
            { casing: 'upper', input: 'foo', output: 'FOO' },
            { casing: 'lower', input: 'bar', output: 'bar' },
            { casing: 'capitalize', input: 'fooBar', output: 'FooBar' },
        ] as const) {

            it(`${casing}`, () => {

                const sanitizer = createCaseSanitizer({
                    casing,
                }) as Validator<string>

                expect(sanitizer(input)).toEqual(output)
            })
        }
    })
})