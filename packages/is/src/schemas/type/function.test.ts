import { $function as $function } from './function'

import { test, expect } from '@jest/globals'

//// Tests ////

test(`${$function.name}`, () => {
    expect($function(parseInt)).toEqual(parseInt)
    expect(() => $function(10)).toThrow('ust be function') 
})
