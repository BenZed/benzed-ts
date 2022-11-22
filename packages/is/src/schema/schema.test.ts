import { schema } from './schema'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const isString = (i: unknown): i is string => typeof i === 'string'

const $string = schema(isString, 'Must be a string')

const $lowerCaseString = $string.transforms(
    i => i.toLowerCase(), 
    'Must be lowercase.'
)

const $password = $string
    .asserts(i => i.length >= 8, 'Must have 8 characters or more')
    .asserts(i => i.match(/[A-Z]/) !== null, 'Must have a capital character.')

//// Tests ////
    
it('schema() type signature', () => {

    expect($string('ace'))
        .toEqual('ace')

    expect(() => $string(100))
        .toThrow('Must be a string')

})

describe('transforms()', () => {

    it('appends a transform validator', () => {
        expect($lowerCaseString('Foo')).toEqual('foo')
    })

    it('is immutable', () => {
        expect($lowerCaseString).not.toBe($string)
        expect($string('Foo')).toEqual('Foo')
    })

    it('error method', () => {

        const $path = $string.transforms(
            i => `/${i}`.replace(/^\/+/, '/'),
            i => `${i} requires a slash`
        )

        expect($path('sup')).toEqual('/sup')

        expect(() => $path('ace-of-base', { transform: false }))
            .toThrow('ace-of-base requires a slash')

    })

})

describe('asserts()', () => {

    it('appends assert validators', () => {
        expect(() => $password('a')).toThrow('Must have 8 characters or more')
        expect(() => $password('abcdefgh')).toThrow('Must have a capital character.')
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

})