import { define } from './define'

import { test, it, expect, describe } from '@jest/globals'

//// Tests ////

describe(define.name, () => {
    
    it('should define a property with a key and descriptor', () => {
        
        const object = {} as Record<string,unknown>

        define(object, 'key', { value: 'value' })
        expect(object.key).toBe('value')
    })

    it('should define multiple properties with a descriptor record', () => {
        const object = { y: 'y' }
        define(object, {
            x: { value: 'x', enumerable: true },
            z: { value: 'z', enumerable: true }
        })
        expect(object).toEqual({ y: 'y', x: 'x', z: 'z' })
    })

    test('Defining with key / descriptor', () => {
        const obj = {} as Record<string,unknown>
        define(obj, 'foo', { value: 'bar' }) 
        expect(obj.foo).toBe('bar')
    })
  
    test('Defining with descriptor map', () => {
        const obj = {} as Record<string,unknown>
        define(obj, { foo: { value: 'bar' } }) 
        expect(obj.foo).toBe('bar')
    })
  
    test('Define sets a symbol property correctly', () => {
        const sym = Symbol('name')
        const obj = {}
        define(obj, sym, {
            value: 'some value',
            enumerable: true
        })
        expect(Object.getOwnPropertySymbols(obj)).toContain(sym)
        expect(obj[sym]).toBe('some value')
    })

})