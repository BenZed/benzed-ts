import { $string } from './string'

import { testValidator } from '../../../util.test'

//// Tests ////

testValidator(
    $string,
    { input: 'hello-world', outputSameAsInput: true }
)