
import { $promise } from './promise'

import { testValidator } from '../../../util.test'
import { pass } from '@benzed/util'

//// Tests //// 

testValidator(
    $promise,
    $promise.name + ' instance',
    { input: new Promise(pass), outputSameAsInput: true },
    { input: 0, error: `ust be a ${$promise.name}` }
)
