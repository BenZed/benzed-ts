import { Validator } from '../type'
import createFormatValidator from './format'

describe('case format validator', () => {

    it('creates a format function', () => {

        const letterThenDigit = createFormatValidator({
            format: { test: /^[a-z]\d$/ }
        }) as Validator<string>

        expect(() => letterThenDigit('f1')).not.toThrow('must be')
        expect(() => letterThenDigit('11')).toThrow('must be')
    })

    describe('signatures', () => {

        it('regex', () => {
            const postalCode =
                createFormatValidator({
                    format: /^\w\d\w-?\d\D\d$/
                }) as Validator<string>

            expect(() => postalCode('H0H0H0')).not.toThrow('must be')
            expect(() => postalCode('H0H-0H0')).not.toThrow('must be')
            expect(() => postalCode('12345')).toThrow('must be')
            expect(() => postalCode('123456')).toThrow('must be')
            expect(() => postalCode('123-456')).toThrow('must be')
        })

        it('email shortcut', () => {
            const emailFormat = createFormatValidator({ format: 'email' }) as Validator<string>

            expect(() => emailFormat('programmer@company.com'))
                .not.toThrow('must be')

            expect(() => emailFormat('not an email'))
                .toThrow('"not an email" must be formatted as email')
        })

        it('url shortcut', () => {
            const urlFormat = createFormatValidator({ format: 'url' }) as Validator<string>

            expect(() => urlFormat('www.google.com')).not.toThrow('must be')
            expect(() => urlFormat('some.website.com')).not.toThrow('must be')
            expect(() => urlFormat('some.website')).toThrow('must be')
            expect(() => urlFormat('Not a url')).toThrow('must be')
        })

        it('alphanumeric shortcut', () => {
            const alphanumeric =
                createFormatValidator({ format: 'alphanumeric' }) as Validator<string>

            expect(() => alphanumeric('1a2s3s')).not.toThrow('must be')
            expect(() => alphanumeric('111')).not.toThrow('must be')
            expect(() => alphanumeric('sss')).not.toThrow('must be')
            expect(() => alphanumeric('$')).toThrow('must be')
        })

        it('numeric shortcut', () => {
            const numeric =
                createFormatValidator({ format: 'numeric' }) as Validator<string>

            expect(() => numeric('1a2s3s')).toThrow('must be')
            expect(() => numeric('111')).not.toThrow('must be')
            expect(() => numeric('sss')).toThrow('must be')
            expect(() => numeric('$')).toThrow('must be')
        })

        it('alpha shortcut', () => {
            const alpha =
                createFormatValidator({ format: 'alpha' }) as Validator<string>

            expect(() => alpha('1a2s3s')).toThrow('must be')
            expect(() => alpha('111')).toThrow('must be')
            expect(() => alpha('sss')).not.toThrow('must be')
            expect(() => alpha('$')).toThrow('must be')
        })

        it('custom error message', () => {

            const error = 'three digits only, damnit'

            const threeDigits =
                createFormatValidator({
                    format: [/^\d\d\d$/, error]
                }) as Validator<string>

            expect(() => threeDigits('111')).not.toThrow(error)
            expect(() => threeDigits('1111')).toThrow(error)
        })
    })
})