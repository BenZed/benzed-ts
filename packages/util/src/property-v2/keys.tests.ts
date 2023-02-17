
import { test, it, expect, describe } from '@jest/globals'
import { keysOf, symbolsOf } from '../types'
import { allKeysOf, allSymbolsOf, ownKeysOf, ownSymbolsOf } from './keys'

////  ////

// Test to ensure keysOf() can iterate through objects with enumerable name or symbol property keys
test('keysOf() can iterate through objects with enumerable name or symbol property keys', () => {
    const testObject = {
        property1: 'value1',
        [Symbol('property2')]: 'value2',
    }

    const expectedKeys = ['property1', Symbol('property2')]
    const actualKeys: (string | symbol)[] = []

    for (const key of keysOf(testObject)) 
        actualKeys.push(key)
    
    expect(actualKeys).toEqual(expectedKeys)
    expect.assertions(1)
})

// Test to ensure no additional properties are returned
test('keysOf() does not return any additional properties', () => {
    const testObject = {
        property1: 'value1',
    }

    const extraProperty = 'extraProperty'
    const expectedKeys = ['property1']
    const actualKeys: (string | symbol)[] = []

    for (const key of keysOf({ ...testObject, [extraProperty]: 'value2' })) 
        actualKeys.push(key)
    
    expect(actualKeys).toEqual(expectedKeys)
    expect.assertions(1)
})

test('ownKeysOf', () => {
    const objects = [{ a: 1 }, { b: 2 }, { c: 3 }]

    const expectedOutput = ['a', 'b', 'c']

    // Set the expected number of assertions
    expect.assertions(expectedOutput.length)

    // Iterate through each item in the array
    for (const object of objects) {
        // Call the function on each object and assert the result
        expect(Array.from(ownKeysOf(object))).toEqual(expect.arrayContaining(expectedOutput))
    }
})

describe('allKeysOf', () => {
    const objectA = { keyA: 'valueA', keyB: 'valueB' } 

    it('should have at least 2 assertions', () => {
        expect.assertions(2) 
    })

    it('should be able to iterate through all own keys', () => {
        const iterator = allKeysOf(objectA) 
        expect(iterator.next().value).toEqual('keyA') 
        expect(iterator.next().value).toEqual('keyB') 
    })

    it('should be able to handle invalid input', () => {
        const invalidInput = 'string'
        // @ts-expect-error Bad input
        expect(() => allKeysOf(invalidInput)).toThrowError(TypeError) 
    })
})

describe('symbolsOf', () => {
    
    it('Should return a non-empty iterator when two objects are passed in', () => {
        const obj1 = { a: 1, b: 3 }
        const obj2 = { c: 2, d: 4 }
        
        const result = symbolsOf(obj1, obj2)
        
        expect.assertions(1)
        expect(result).not.toBeNull()
        expect(result.next()).not.toThrow()
    })
    
    it('Should return a specific symbol when one object is passed in', () => {
        const obj1 = { a: 1, b: 3, [Symbol.for('test')]: 'test' }
        
        const result = symbolsOf(obj1)
        
        expect.assertions(2)
        expect(result).not.toBeNull()
        expect(result.next()).toStrictEqual({ value: Symbol.for('test'), done: false })
    })

})

describe('ownSymbolsOf', () => {

    it('Should return a non-empty iterator when two objects are passed in', () => {
        const obj1 = { [Symbol.for('test1')]: 'first', [Symbol.for('test2')]: 'second' }
        const obj2 = { [Symbol.for('test3')]: 'third', [Symbol.for('test4')]: 'fourth' }
        const obj2Proto = Object.create(obj2)
        
        const resultObject1 = ownSymbolsOf(obj1)
        const resultObject2 = ownSymbolsOf(obj2)
        const resulPrototype = ownSymbolsOf(obj2Proto)
        
        expect.assertions(2)
        expect(resultObject1.next()).toStrictEqual({value: Symbol.for('test1'), done: false})
        expect(resultObject2.next()).toStrictEqual({value: Symbol.for('test3'), done: false})
        expect(resulPrototype.next()).toBeUndefined()
    })

})

describe('allSymbolsOf', () => {

    it('Should return all own and inherited symbols', () => {
        const obj1 = { [Symbol.for('test1')]: 'first', [Symbol.for('test2')]: 'second' }
        const obj2 = { [Symbol.for('test3')]: 'third', [Symbol.for('test4')]: 'fourth' }
        const obj2Proto = Object.create(obj2)

        const resultObject1 = allSymbolsOf(obj1)
        const resultObject2 = allSymbolsOf(obj2)
        const resulPrototype = allSymbolsOf(obj2Proto)
        
        expect.assertions(4)
        expect(resultObject1.next()).toStrictEqual({value: Symbol.for('test1'), done: false})
        expect(resultObject2.next()).toStrictEqual({value: Symbol.for('test3'), done: false})
        expect(resulPrototype.next()).toStrictEqual({value: Symbol.for('test3'), done: false})
        expect(resulPrototype.next()).toStrictEqual({value: Symbol.for('test4'), done: false})
    })

})
