
import { $weakmap } from './weak-map'

import { testValidator } from '../../../util.test'

//// Tests ////

testValidator(
    $weakmap,
    $weakmap.name + ' instance',
    { input: new $weakmap.Type(), outputSameAsInput: true },
    { input: 0, error: `ust be ${$weakmap.name}` }
)
