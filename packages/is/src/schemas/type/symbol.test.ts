
import { $symbol } from './symbol'

import { testValidator } from '../../util.test'

//// Tests //// 

testValidator(
    $symbol,
    $symbol.name + ' type',
    { input: Symbol(), outputSameAsInput: true },
    { input: 1, error: `ust be ${$symbol.name}` }
)
