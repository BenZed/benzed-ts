
import { $date } from './date'

import { testValidator } from '../../../util.test'

//// Tests //// 

testValidator(
    $date,
    $date.name + ' instance',
    { input: new $date.Type(), outputSameAsInput: true },
    { input: 0, error: `ust be ${$date.name}` }
)
