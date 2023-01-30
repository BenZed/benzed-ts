import { Shape } from './shape'

import { $number } from '../type/numeric'

import { testValidator } from '../../util.test'

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
        { input: 5, error: 'Must be an object' },
        { input: { x: 0, y: 0 }, outputSameAsInput: true },
        { input: { x: 5, y: 'v5' }, error: 'y Must be number' },
        { input: { x: 5, y: '5' }, error: 'y Must be number', transform: false },
    ) 

    it('name', () => {
        expect($vector.name).toBe('shape')
        expect($vector.named('vector').name).toBe('vector')
    })

})