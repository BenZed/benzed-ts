
import { $weakset } from './weak-set'

import { testValidator } from '../../../util.test'

//// Tests ////

testValidator(
    $weakset,
    $weakset.name + ' instance',
    { input: new $weakset.Type(), outputSameAsInput: true },
    { input: 0, error: `ust be ${$weakset.name}` }
)
