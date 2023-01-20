import { reduceSchematics } from './reduce-schematics'

import { test, expect } from '@jest/globals'

import { Boolean, isBoolean, isString, String } from '../../schema'
import { Or } from '../or'

import { expectTypeOf } from 'expect-type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Tests ////

test('multiple inputs resusult in an Or union', () => {

    const isBoolOrString = reduceSchematics(isBoolean, isString)

    expect(isBoolOrString).toBeInstanceOf(Or)
    expect(isBoolOrString(true)).toBe(true)
    expect(isBoolOrString('2')).toBe(true)

    expectTypeOf(isBoolOrString)
        .toEqualTypeOf<Or<[Boolean, String]>>()
})

test.todo('unions are flattened')

test.todo('multiple equal values are merged')
