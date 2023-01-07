import { asNil, isObject, isString as _isString } from '@benzed/util'
import { Validator } from './validator'

const isString = new Validator({
    error: 'must be a string',
    transform: i => asNil(i) && !isObject(i) ? `${i}` : i,
    is: _isString 
})

describe(`${Validator.name}()`, () => {

    it('options.is', () => {
        expect(isString('hey')).toEqual('hey')
        expect(() => isString({})).toThrow('must be a string')
    })

    it('options.transform', () => {
        expect(isString(10)).toEqual('10')
        expect(isString(true)).toEqual('true')
        expect(() => isString(null)).toThrow('must be a string')
    })

    it('options.error', () => {
        expect(() => isString(null)).toThrow('must be a string')
    })

})

