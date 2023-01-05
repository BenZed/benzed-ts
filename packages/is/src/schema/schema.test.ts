import { copy } from '@benzed/immutable'

import { Assert, schema } from './schema'

import { expectTypeOf } from 'expect-type'

import { describe, it, expect } from '@jest/globals'

//// Setup ////

const isString = (i: unknown): i is string => typeof i === 'string'

const $string = schema({ assert: isString, error: 'must be type string' })

const $lowerCaseString = $string.transforms(
    i => i.toLowerCase(), 
    'Must be lowercase.'
)

const $password = $string
    .asserts(i => i.length >= 8, 'must have 8 characters or more')
    .asserts(i => !!i.match(/[A-Z]/), 'must have a capital character.')

//// Tests //// 
    
describe('schema()', () => {

    it('schema() type signature', () => {
        expect($string('ace'))
            .toEqual('ace')

        expect(() => $string(100))
            .toThrow('must be type string')
    })

    it('context.transform', () => {
        const $shout = $string
            .transforms(s => `${s}!`.replace(/!+$/, '!'))

        expect(() => $shout('Ace', { transform: false }))
            .toThrow('Validation failed')
    })

    it('context.path', () => {
        expect(() => $string(100, { path: ['ace']}))
            .toThrow('ace must be type string')
    })
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
        expect(() => $password('a')).toThrow('must have 8 characters or more')
        expect(() => $password('abcdefgh')).toThrow('must have a capital character.')
    })

    it('is immutable', () => {
        expect($password).not.toBe($string)
    })

})

describe('assert()', () => {

    it('is a type assertion', () => {
        const value: unknown = 'Ace'
        const assertString: Assert<typeof $string> = $string.assert.bind($string)

        assertString(value)
        expectTypeOf(value).toEqualTypeOf<string>()
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