
import { $error } from './error'

import { testValidator } from '../../../util.test'

//// Tests //// 

testValidator(
    $error,
    $error.name + ' instance',
    { input: new $error.Type(), outputSameAsInput: true },
    { input: 0, error: `ust be ${$error.name}` }
)
