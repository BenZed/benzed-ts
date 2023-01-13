import { Schema } from './schema'
import { isString as _isString } from '@benzed/util'

import { copy } from '@benzed/immutable'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const isString = new Schema({
    is: _isString, 
    error: 'must be type string' 
})

const isLowerCaseString = isString.transforms( 
    i => i.toLowerCase(), 
    'Must be lowercase.'
) 
 
const isPassword = isString
    .asserts(i => i.length >= 8, 'must have 8 characters or more')
    .asserts(i => !!i.match(/[A-Z]/), 'must have a capital character.')

//// Tests //// 
    
describe('schema()', () => { 

    it('schema() type signature', () => {
        expect(isString.validate('ace'))
            .toEqual('ace')

        expect(() => isString.validate(100))
            .toThrow('must be type string')
    })
 
    it('context.transform', () => {
        const $shout = isString
            .transforms(s => `${s}!`.replace(/!+$/, '!'))

        expect(() => $shout.validate('Ace', { transform: false }))
            .toThrow('Validation failed')
    })

    it('context.path', () => {
        expect(() => isString.validate(100, { path: ['ace']}))
            .toThrow('ace must be type string')
    })
})

describe('transforms()', () => {

    it('appends a transform validator', () => {
        expect(isLowerCaseString.validate('Foo')).toEqual('foo')
    })

    it('is immutable', () => {
        expect(isLowerCaseString).not.toBe(isString)
        expect(isString.validate('Foo')).toEqual('Foo')
    })

    it('error method', () => {  

        const isPath = isString.transforms(
            i => `/${i}`.replace(/^\/+/, '/'),
            i => `${i} requires a slash`
        )

        expect(isPath.validate('sup')).toEqual('/sup')

        expect(() => isPath.validate('ace-of-base', { transform: false }))
            .toThrow('ace-of-base requires a slash')
    }) 
})

describe('asserts()', () => {

    it('appends assert validators', () => {
        expect(() => isPassword.validate('a')).toThrow('must have 8 characters or more')
        expect(() => isPassword.validate ('abcdefgh')).toThrow('must have a capital character.')
    })

    it('is immutable', () => { 
        expect(isPassword).not.toBe(isString)
    }) 

}) 

describe('is()', () => {  
 
    it('returns true if value is valid', () => {
        expect(isPassword.is('1234567A')).toBe(true)
    })

    it('returns false if value is not valid', () => {
        isLowerCaseString.is = isLowerCaseString.constructor.prototype.is.bind(isLowerCaseString)
        expect(isLowerCaseString.is('Ace')) 
            .toBe(false)
    })

    it('is a type guard', () => {
        const value: unknown = 'Ace'
        if (isString.is(value))
            expectTypeOf(value).toEqualTypeOf<string>()
    })

    it('is bound', () => {
        expect(['string'].some(isString.is)).toBe(true)
    })

})

describe('assert()', () => {

    it('does not throw if input is valid', () => {
        expect(() => isPassword.assert('1234567A')).not.toThrow()
    })  

    it('throws if input is not valid', () => {
        expect(() => isLowerCaseString.assert('Ace')).toThrow('Must be lowercase')
    })

    it('is bound', () => {
        const assertString = isString.assert
        expect(() => assertString('string')).not.toThrow()
    })

})

describe('Copyable', () => {

    it('can be immutably copied', () => {
        const isString2 = copy(isString)
        expect(isString2).not.toBe(isString)
    })

})