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

testValidator( 
    $number.min(5),
    { asserts: 5 },
    { asserts: 4, error: 'must be above or equal 5' }
)

testValidator(
    $number.above(10),
    { asserts: 11 },
    { asserts: 10, error: 'must be above 10' },
)

testValidator(
    $number.min(5).max(10),
    { asserts: 5 },
    { asserts: 4, error: 'must be above or equal 5' },
    { asserts: 10 },
    { asserts: 11, error: 'must be below or equal 10' }
)

testValidator(
    $number.even(),
    { asserts: 4 },
    { asserts: 5, error: 'must be even'}
)