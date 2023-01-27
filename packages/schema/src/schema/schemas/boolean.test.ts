
import $boolean from './boolean'
import { testValidator } from '../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

testValidator(
    $boolean,
    'type of boolean',
    { input: true, output: true, transform: false },
    { input: false, output: false, transform: false },
)

testValidator(
    $boolean,
    'cast to boolean',
    { input: 'true', output: true },
    { input: 1, output: true },
    { input: 1n, output: true },
    { input: 'false', output: false },
    { input: 0, output: false },
    { input: 0n, output: false },
)
 