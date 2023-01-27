
import $unknown from './unknown'
import { testValidator } from '../../util.test'
import { nil } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

for (const unknown of [10, -10, Infinity, null, nil, NaN, {}, 'string', 0, Symbol()]) {
    testValidator(
        $unknown,
        'type of unknown',
        { input: unknown, output: unknown },
        { input: unknown, output: unknown, transform: false },
    )
}

