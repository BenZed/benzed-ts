import { $$copy } from '@benzed/immutable'
import TypeValidator from './type'

const fooValidator = new TypeValidator<'foo'>({
    name: 'foo',
    is: (input): input is 'foo' => input === 'foo',
})

const fooValidatorWithError = fooValidator[$$copy]()
fooValidatorWithError.applySettings({ error: 'you fucked up' })

const fooValidatorWithCast = fooValidator[$$copy]()
fooValidatorWithCast.applySettings({ cast: input => typeof input === 'string' ? 'foo' : input })

it('validates input data', () => {
    expect(fooValidator.validate('foo', false))
        .toEqual('foo')
})

it('uses name setting in default error', () => {
    expect(() => fooValidator.validate('bar', false))
        .toThrow('bar is not foo')
})

it('allows error setting', () => {
    expect(() => fooValidatorWithError.validate('bar', false))
        .toThrow('you fucked up')
})

it('allows casting when transforms enabled', () => {
    expect(() => fooValidatorWithCast.validate(null, true))
        .toThrow()

    expect(fooValidatorWithCast.validate('any', true))
        .toEqual('foo')

    expect(() => fooValidatorWithCast.validate('any', false))
        .toThrow('foo')
})