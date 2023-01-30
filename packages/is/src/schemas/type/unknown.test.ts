
import { $unknown } from './unknown'

import { testValidator } from '../../util.test'

//// Tests //// 

testValidator(
    $unknown,
    $unknown.name + ' type',
    { input: 1, outputSameAsInput: true },
    { input: 1, error: `ust be ${$unknown.name}` }
)
