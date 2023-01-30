
import { $weakmap } from './weak-map'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isWeakMap', () => {
    expect($weakmap(new WeakMap())) 
        .toEqual(new WeakMap())

    expect(() => $weakmap.validate(''))
        .toThrow('ust be WeakMap') 
})

