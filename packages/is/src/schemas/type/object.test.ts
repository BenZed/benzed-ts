
import { $object } from './object'

import { testValidator } from '../../util.test'

//// Tests //// 

testValidator(
    $object,
    $object.name + ' types',
    { input: {}, outputSameAsInput: true },
    { input: 1, error: `ust be ${$object.name}` }
)
