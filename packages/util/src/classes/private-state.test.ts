import { PrivateState } from './private-state'

class TestClass { }

let privateState: PrivateState<TestClass, object>
  
beforeEach(() => {  
    privateState = PrivateState.for(TestClass)
})

test('should create a private state for a class', () => {
    const instance = new TestClass()
    expect(privateState.has(instance)).toBe(false)
    privateState.set(instance, {})
    expect(privateState.has(instance)).toBe(true)
})

test('should throw an error if the object is not an instance of the class', () => {
    expect(() => privateState.set({} as TestClass, {})).toThrowError()
})

test('should get the private state of an object', () => {
    const object = new TestClass()
    privateState.set(object, { test: true })
    expect(privateState.get(object)).toEqual({ test: true })
})

test('should delete the private state of an object', () => {
    const object = new TestClass()
    privateState.set(object, {})
    privateState.delete(object)
    expect(PrivateState.has(object)).toBe(false)
})

test('should throw an error if trying to get the state of an object without state', () => {
    expect(() => privateState.get(new TestClass())).toThrowError()
})
