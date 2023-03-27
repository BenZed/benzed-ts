import { Boolean } from './boolean'

import { test, it, expect, describe } from '@jest/globals'

//// Tests ////

test(`${Boolean.name}`, () => {
    
    const $boolean = new Boolean

    expect($boolean(true)).toBe(true)
    expect($boolean(false)).toBe(false)

})
