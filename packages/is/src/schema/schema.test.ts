import { Schema } from './schema'
import { isString } from '@benzed/util'

//// Setup ////

const $string = new Schema({ is: isString, error: 'must be type string' })
console.log($string, { ...$string })
 
/*

const $lowerCaseString = $string.transforms( 
    i => i.toLowerCase(), 
    'Must be lowercase.'
) 
 
const $password = $string
    .asserts(i => i.length >= 8, 'must have 8 characters or more')
    
// .asserts(i => !!i.match(/[A-Z]/), 'must have a capital character.')

//// Tests //// 
    
describe('schema()', () => {

    it('schema() type signature', () => {
        expect($string.validate('ace'))
            .toEqual('ace')

        expect(() => $string.validate(100))
            .toThrow('must be type string')
    })
 
    it('context.transform', () => {
        const $shout = $string
            .transforms(s => `${s}!`.replace(/!+$/, '!'))

        expect(() => $shout.validate('Ace', { transform: false }))
            .toThrow('Validation failed')
    })

    it('context.path', () => {
        expect(() => $string.validate(100, { path: ['ace']}))
            .toThrow('ace must be type string')
    })
})

describe('transforms()', () => {

    it('appends a transform validator', () => {
        expect($lowerCaseString.validate('Foo')).toEqual('foo')
    })

    it('is immutable', () => {
        expect($lowerCaseString).not.toBe($string)
        expect($string.validate('Foo')).toEqual('Foo')
    })

    it('error method', () => {

        const $path = $string.transforms(
            i => `/${i}`.replace(/^\/+/, '/'),
            i => `${i} requires a slash`
        )

        expect($path.validate('sup')).toEqual('/sup')

        expect(() => $path.validate('ace-of-base', { transform: false }))
            .toThrow('ace-of-base requires a slash')
    })
})

describe('asserts()', () => {

    it('appends assert validators', () => {
        expect(() => $password.validate('a')).toThrow('must have 8 characters or more')
        expect(() => $password.validate ('abcdefgh')).toThrow('must have a capital character.')
    })

    it('is immutable', () => {
        expect($password).not.toBe($string)
    }) 

})

describe('is()', () => {

    it('returns true if value is valid', () => {
        expect($password.is('1234567A')).toBe(true)
    })

    it('returns false if value is not valid', () => {
        expect($lowerCaseString.is('Ace')).toBe(false)
    })

    it('is a type guard', () => {
        const value: unknown = 'Ace'
        if ($string.is(value))
            expectTypeOf(value).toEqualTypeOf<string>()
    })

    it('is bound', () => {
        const isString = $string.is
        expect(isString('string')).toBe(true)
    })

})

describe('Copyable', () => {

    it('can be immutably copied', () => {
        const $stringCopy = copy($string)
        expect($stringCopy).not.toBe($string)
    })

})

*/