import { it } from 'node:test'

import { testValidator } from '../util.test'
import { $range } from './range'

//// Tests ////

testValidator(
    $range, 
    {
        input: 0,
        output: 0
    }
)