import { $bigint } from './big-int'

import { testValidator } from '../../../util.test'

//// Tests ////

testValidator<unknown, bigint>( 
    $bigint,
    { transforms: 0n },
    { asserts: 0n }
)

testValidator(
    $bigint.min(5n),
    { asserts: 5n },
    { asserts: 4n, error: 'must be above or equal 5' }
)

testValidator(
    $bigint.above(10n),
    { asserts: 11n },
    { asserts: 10n, error: 'must be above 10' },
)

testValidator(
    $bigint.limit('>=', 5n),
    { asserts: 5n },
    { asserts: 6n },
    { asserts: 4n, error: 'must be above or equal 5' },
)

testValidator(
    $bigint.below(10n),
    { asserts: 9n },
    { asserts: 10n, error: 'must be below 10' },
)

testValidator(
    $bigint.min(5n).max(10n),
    { asserts: 5n }, 
    { asserts: 4n, error: 'must be above or equal 5' },
    { asserts: 10n },
    { asserts: 11n, error: 'must be below or equal 10' }
)