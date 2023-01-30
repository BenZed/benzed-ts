import { $object } from './object'

import { test, expect } from '@jest/globals'
 
//// Tests ////
 
test(`${$object.name}`, () => {
    expect($object({})).toEqual({})
    expect(() => $object(10)).toThrow('ust be object') 
})
