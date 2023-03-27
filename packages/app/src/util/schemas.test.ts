import { isPath } from './schemas'

import { test, it, expect, describe } from '@jest/globals'

import { testValidator } from '../util.test'
import { OutputValidator } from '@benzed/schema'

//// Tests ////

const shout = new OutputValidator({
    transform: function hasExclaimation(i: string) {
        return i.endsWith('!') ? i : i + '!'
    }
}) 

testValidator(
    shout,
    { transforms: 'hey!' },
    { transforms: 'hey', output: 'hey!'}
) 

testValidator(
    isPath.validate,
    { transforms: 'path', output: '/path' },
)