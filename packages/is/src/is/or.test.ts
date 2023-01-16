import { test } from '@jest/globals'

import { OR } from './or'
import { isString } from '../schema'

//// Tests ////

test(`${OR.name}`, () => {

    console.log(isString) 

    const stringOr = new OR(isString)

    const stringOrBool = stringOr.boolean

    console.log(stringOrBool) 
})
