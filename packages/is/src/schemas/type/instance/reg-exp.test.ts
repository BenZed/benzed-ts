
import { $regexp } from './reg-exp'

import { testValidator } from '../../../util.test'

//// Tests ////

testValidator(
    $regexp,
    $regexp.name + ' instance',
    { input: new $regexp.Type('a|b'), outputSameAsInput: true },
    { input: 0, error: `ust be ${$regexp.name}` }
)
