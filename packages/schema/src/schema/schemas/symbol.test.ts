
import $symbol from './symbol'
import { testValidator } from '../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

testValidator(
    $symbol,
    'type of symbol',
    { input: Symbol.iterator, output: Symbol.iterator, transform: false },
    { input: false, error: 'ust be a symbol', transform: false },
    { input: 0, error: 'ust be a symbol', transform: false },
    { input: 'false', error: 'ust be a symbol', transform: false },
    { input: {}, error: 'ust be a symbol', transform: false },
)
