import { Tuple } from './tuple'

import { $number } from '../type/numeric'

import { testValidator } from '../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/  

//// Setup ////

const $range = new Tuple($number, $number) 

//// Tests ////

describe('basic tuple', () => { 

    testValidator(
        $range,
        { input: 5, error: 'Must be a tuple' },
        { input: [5, 5], outputSameAsInput: true },
        { input: [5, '5'], output: [5,5] },
    ) 

    it('name', () => {
        expect($range.name).toBe('tuple')
        expect($range.named('range').name).toBe('range')
    })

})