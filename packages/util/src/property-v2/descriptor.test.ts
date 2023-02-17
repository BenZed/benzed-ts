import { allDescriptorsOf, descriptorsOf, ownDescriptorsOf } from './descriptor'

// Create some test objects
const obj1 = { a: 1 }
const obj2 = { b: 'abc' }

// Do the tests
describe('descriptorsOf', () => {
    it('should return an iterable iterator of key-descriptor pairs on any number of objects', () => {
        expect(descriptorsOf(obj1, obj2).next().value).toEqual(['a', Object.getOwnPropertyDescriptor(obj1, 'a')])
    })
    it('should be able to iterate over all objects', () => {
        const descriptors = [...descriptorsOf(obj1, obj2)]
        expect(descriptors.length).toBe(2)
        expect(descriptors).toEqual([['a', Object.getOwnPropertyDescriptor(obj1, 'a')], ['b', Object.getOwnPropertyDescriptor(obj2, 'b')]])
    })
})

describe('ownDescriptorsOf function', () => {
    it('should take any number of objects and return descriptors for any own properties', () => {
        const object1 = {a: 1}
        const object2 = {b: 2}
        const result = ownDescriptorsOf(object1, object2)

        expect(result).toHaveLength(2)
    })
    
    it('should not take prototypes into account', () => {
        const object1 = {a: 1}
        const dummy: any = function () { /**/ }
        Object.defineProperty(dummy.prototype, 'c', {value: 3})
        const result = ownDescriptorsOf(object1, dummy)
        
        expect(result).toHaveLength(1)
    })
})

describe('allDescriptorsOf', () => {

    // Test that with a single object argument, the given argument is used.
    it('should take a single object as an argument', () => {
        const obj = {name: 'John', age: 30}
        const result = [...allDescriptorsOf(obj)]
    
        expect(result).toEqual([['name', Object({value: 'John', writable: true, enumerable: true, configurable: true })], 
            ['age', Object({value: 30, writable: true, enumerable: true, configurable: true })]])
    })
    
    // Test that with multiple object arguments, all given arguments are used.
    it('should take multiple objects as arguments', () => {
        const obj1 = {firstName: 'John', lastName: 'Doe'}
        const obj2 = {age: 30, city: 'New York'}
        const result = [...allDescriptorsOf(obj1, obj2)]
    
        expect(result).toEqual([['firstName', Object({value: 'John', writable: true, enumerable: true, configurable: true})], 
            ['lastName', Object({value: 'Doe', writable: true, enumerable: true, configurable: true })], 
            ['age', Object({value: 30, writable: true, enumerable: true, configurable: true })], 
            ['city', Object({value: 'New York', writable: true, enumerable: true, configurable: true })]])
    })
    
    // Test that all properties of all given arguments are returned,
    // regardless of enumerabilities or prototype.
    it('should return all properties, regardless of enumerability or prototype', () => {
        const obj1 = {a:1, b:2, c:3, d:4}
        Object.defineProperty(obj1, 'e', {value: 5, enumerable: false})
        const obj2 = Object.create(obj1)
        obj2.f = 6
        const result = [...allDescriptorsOf(obj1, obj2)]
    
        expect(result).toEqual([['a', Object({value: 1, writable: true, enumerable: true, configurable: true })], 
            ['b', Object({value: 2, writable: true, enumerable: true, configurable: true })], 
            ['c', Object({value: 3, writable: true, enumerable: true, configurable: true })], 
            ['d', Object({value: 4, writable: true, enumerable: true, configurable: true })],
            ['e', Object({value: 5, writable: false, enumerable: false, configurable: true })],
            ['f', Object({value: 6, writable: true, enumerable: true, configurable: true })]])
    })
})