import { nil } from '@benzed/util/lib'
import { Validator, validator } from './validator'

const $string = validator({
    error: 'must be a string',
    transform: i => typeof i !== 'object' && i !== nil ? `${i}` : i,
    assert: (i): i is string => typeof i === 'string'
})

describe(`${validator.name}()`, () => {
    it('options.assert', () => {
        expect($string('hey')).toEqual('hey')
        expect(() => $string({})).toThrow('must be a string')
    })

    it('options.transform', () => {
        expect($string(10)).toEqual('10')
        expect($string(true)).toEqual('true')
        expect(() => $string(null)).toThrow('must be a string')
    })

    it('options.error', () => {
        expect(() => $string(null)).toThrow('must be a string')
    })
})

