import { $number } from './number'

import { testValidator } from '../../../util.test'

//// Tests ////
  
testValidator(
    $number,
    { transforms: 0 },
    { asserts: 0 }
)

testValidator(
    $number.round(), 
    { transforms: 1.5, output: 2 },
    { asserts: 1.5, error: 'must be rounded' }
)

testValidator(
    $number.floor(),
    { transforms: 1.5, output: 1 },
    { asserts: 1.5, error: 'must be rounded' } 
)