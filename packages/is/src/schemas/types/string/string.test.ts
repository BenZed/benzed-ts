import { $string } from './string'

import { testValidator } from '../../../util.test'

//// Tests ////
  
testValidator(
    $string,
    { transforms: 'hello-world' }
)

testValidator(
    $string.camel(),
    { transforms: 'hello-world', output: 'helloWorld' },
    { asserts: 'hello-world', error: 'must be in camel case' }
)

testValidator(
    $string.trim(),
    { transforms: ' ace ', output: 'ace' },
    { asserts: ' ace ', error: 'must be trimmed' }
)