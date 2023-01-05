import { asNil, isObject, isString } from '@benzed/util'
import { Validator } from './validator'

const $string = new Validator({
    error: 'must be a string',
    transform: i => asNil(i) && !isObject(i) ? `${i}` : i,
    is: isString 
})

describe(`${Validator.name}()`, () => {

    it('options.is', () => {
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

