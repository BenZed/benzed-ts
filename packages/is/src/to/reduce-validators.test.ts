import { reduceValidators } from './reduce-validators'

import { test, expect } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { 
    $boolean, 
    Boolean, 
    $string,
    String 
} from '../schemas'

import { Or } from '@benzed/schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Tests ////

test('multiple inputs resusult in an Or union', () => {

    const $boolOrString = reduceValidators($boolean, $string)

    expect($boolOrString).toBeInstanceOf(Or)
    expect($boolOrString(true)).toBe(true)
    expect($boolOrString('2')).toBe('2')

    expectTypeOf($boolOrString)
        .toEqualTypeOf<Or<[Boolean, String]>>()
})

test.todo('unions are flattened')

test.todo('multiple equal values are merged')
