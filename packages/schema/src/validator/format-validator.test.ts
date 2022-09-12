
import FormatValidator from './format-validator'

it('creates a format function', () => {

    const letterThenDigit = new FormatValidator({
        format: /^[a-z]\d$/
    })

    expect(() => letterThenDigit.validate('f1')).not.toThrow('must be')
    expect(() => letterThenDigit.validate('11')).toThrow('must be')
})

describe('signatures', () => {

    it('regex', () => {
        const postalCode =
            new FormatValidator({
                format: /^\w\d\w-?\d\D\d$/
            })

        expect(() => postalCode.validate('H0H0H0')).not.toThrow('must be')
        expect(() => postalCode.validate('H0H-0H0')).not.toThrow('must be')
        expect(() => postalCode.validate('12345')).toThrow('must be')
        expect(() => postalCode.validate('123456')).toThrow('must be')
        expect(() => postalCode.validate('123-456')).toThrow('must be')
    })

    it('email shortcut', () => {
        const emailFormat = new FormatValidator({ format: 'email' })

        expect(() => emailFormat.validate('programmer@company.com'))
            .not.toThrow('must be')

        expect(() => emailFormat.validate('not an email'))
            .toThrow('not an email must be formatted as email')
    })

    it('url shortcut', () => {
        const urlFormat = new FormatValidator({ format: 'url' })

        expect(() => urlFormat.validate('www.google.com')).not.toThrow('must be')
        expect(() => urlFormat.validate('some.website.com')).not.toThrow('must be')
        expect(() => urlFormat.validate('some.website')).toThrow('must be')
        expect(() => urlFormat.validate('Not a url')).toThrow('must be')
    })

    it('alphanumeric shortcut', () => {
        const alphanumeric =
            new FormatValidator({ format: 'alphanumeric' })

        expect(() => alphanumeric.validate('1a2s3s')).not.toThrow('must be')
        expect(() => alphanumeric.validate('111')).not.toThrow('must be')
        expect(() => alphanumeric.validate('sss')).not.toThrow('must be')
        expect(() => alphanumeric.validate('$')).toThrow('must be')
    })

    it('numeric shortcut', () => {
        const numeric =
            new FormatValidator({ format: 'numeric' })

        expect(() => numeric.validate('1a2s3s')).toThrow('must be')
        expect(() => numeric.validate('111')).not.toThrow('must be')
        expect(() => numeric.validate('sss')).toThrow('must be')
        expect(() => numeric.validate('$')).toThrow('must be')
    })

    it('alpha shortcut', () => {
        const alpha =
            new FormatValidator({ format: 'alpha' })

        expect(() => alpha.validate('1a2s3s')).toThrow('must be')
        expect(() => alpha.validate('111')).toThrow('must be')
        expect(() => alpha.validate('sss')).not.toThrow('must be')
        expect(() => alpha.validate('$')).toThrow('must be')
    })

    it('custom error message', () => {

        const error = 'three digits only, damnit'

        const threeDigits =
            new FormatValidator({
                format: /^\d\d\d$/,
                error
            })

        expect(() => threeDigits.validate('111')).not.toThrow(error)
        expect(() => threeDigits.validate('1111')).toThrow(error)
        expect(() => threeDigits.validate('11')).toThrow(error)
    })
})