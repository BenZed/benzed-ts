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
    { asserts: 'hello-world', error: 'Must be in Camel case' }
)