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

    const isBoolOrString = reduceValidators($boolean, $string)

    expect(isBoolOrString).toBeInstanceOf(Or)
    expect(isBoolOrString(true)).toBe(true)
    expect(isBoolOrString('2')).toBe(true)

    expectTypeOf(isBoolOrString)
        .toEqualTypeOf<Or<[Boolean, String]>>()
})

test.todo('unions are flattened')

test.todo('multiple equal values are merged')
