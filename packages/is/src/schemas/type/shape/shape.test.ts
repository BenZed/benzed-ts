import { Shape } from './shape'

import { $number } from '../numeric'

import { testValidator } from '../../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

const $vector = new Shape({
    x: $number,
    y: $number
})

//// Tests ////

describe('basic shape', () => {
 
    testValidator(
        $vector,
        { input: 5, error: 'Must be a shape' },
        { input: { x: 0, y: 0 }, outputSameAsInput: true },
        { input: { x: 5, y: 'v5' }, error: 'y Must be number' },
        { input: { x: 5, y: '5' }, error: 'y Must be number', transform: false },
    )

})