
import $primitive from './primitive'
import { testValidator } from '../../util.test'
import { nil, toVoid } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

for (const primitive of [10, -10, Infinity, null, nil, NaN, 'string', 0, Symbol()]) {
    testValidator(
        $primitive,
        'type of unknown',
        { input: primitive, output: primitive },
        { input: primitive, output: primitive, transform: false },
    )
}

for (const bad of [{}, [], toVoid, /regexp/]) {
    testValidator(
        $primitive,
        'type of primitive',
        { input: bad, error: 'ust be a primitive' },
        { input: bad, error: 'ust be a primitive', transform: false }, 
    )
}