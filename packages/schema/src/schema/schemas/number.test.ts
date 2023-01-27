
import $number from './number'
import { testValidator } from '../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

testValidator(
    $number,
    'type of number',
    { input: 0, output: 0, transform: false },
    { input: NaN, error: 'ust be a number', transform: false },
    { input: false, error: 'ust be a number', transform: false }, 
)

testValidator(  
    $number,
    'cast to number',
    { input: '0', output: 0, },
    { input: 10n, output: 10, },
    { input: true, output: 1, },
    { input: false, output: 0, },
    { input: 'ace', error: 'ust be a number', },
)

testValidator(
    $number,
    'must be finite by default',
    { input: Infinity, error: 'Must be finite', transform: false },
) 

testValidator(
    $number.finite(false),
    'infinite by default',
    { input: Infinity, output: Infinity, transform: false },
)

testValidator(
    $number.round(),
    'round',
    { input: 1, output: 1 },
    { input: 1.2, output: 1 }, 
    { input: 1.7, output: 2 },
    { input: 1.2, error: 'Must be rounded', transform: false },
) 

testValidator(
    $number.round(2),
    'round by large precision',
    { input: 1.2, output: 2 },
    { input: 2, output: 2 },
    { input: 3, output: 4},
    { input: 3, error: 'Must be rounded by 2', transform: false },
)

testValidator(
    $number.round(0.5),
    'round by small precision',
    { input: 1.3, output: 1.5 },
    { input: 0.6, output: 0.5 },
    { input: 3, output: 3 },
    { input: 3.3, error: 'Must be rounded by 0.5', transform: false },
)

testValidator(
    $number.floor(), 
    'floor',
    { input: 1.7, output: 1 },
    { input: 1.7, error: 'Must be floored', transform: false },
    
)

testValidator(
    $number.ceil(),
    'ceil',
    { input: 1.2, output: 2 },
    { input: 1.2, error: 'Must be ceiled', transform: false },
    
)