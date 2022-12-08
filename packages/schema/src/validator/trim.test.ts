import TrimValidator from './trim'

const trimValidator = new TrimValidator({})

it('trims strings', () => {
    expect(trimValidator.validate(' one ', true))
        .toEqual('one')
})

it('throws if string is not trimmed and transform is not allowed', () => {

    expect(() => trimValidator.validate(' one ', false))
        .toThrow('cannot begin or end with whitespace')

})

it('allows custom error string', () => {

    const trimValidatorWithError = new TrimValidator({ error: 'no whitespace you coward' })

    expect(() => trimValidatorWithError.validate(' ', false))
        .toThrow('no whitespace you coward')
})

it('allows custom error method', () => {

    const trimValidatorWithError = new TrimValidator({
        error: input => input.trim() === ''
            ? 'that entire value was whitespace you disappointment'
            : 'at least you tried!'
    })

    expect(() => trimValidatorWithError.validate(' ', false))
        .toThrow('that entire value was whitespace you disappointment')

})
