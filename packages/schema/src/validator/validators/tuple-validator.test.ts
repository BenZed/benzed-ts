import { TupleValidator } from './tuple-validator'
import { TypeValidator } from '../validators'
import { testValidator } from '../../util.test'

import { isBoolean, isString } from '@benzed/util'
import { ValidateOutput } from '../../validate'

import { expectTypeOf } from 'expect-type'

import { it } from '@jest/globals'

//// Setup ////

const $name = new class Name extends TypeValidator<string> { 
    isValid = isString
}

const $flag = new class Flag extends TypeValidator<boolean> {
    isValid = isBoolean
}

const $nameFlagFlag = new TupleValidator($name, $flag, $flag)

//// Tests ////

it('output type', () => {
    type NameFlagFlagOutput = ValidateOutput<typeof $nameFlagFlag>
    expectTypeOf<NameFlagFlagOutput>().toEqualTypeOf<[string, boolean, boolean]>()
})

testValidator<unknown[], [string, boolean, boolean]>(
    $nameFlagFlag,

    // Invalid input test cases
    {
        transforms: [10, true, false],
        error: true
    },
    {
        transforms: ['test', 10, false],
        error: true
    }, 
    {
        transforms: ['test', true, 'false'],
        error: 'index 2 must be Flag'
    },
    {
        asserts: ['test', true, true, true],
        error: 'must have exactly 3 elements'
    },
    { 
        asserts: ['foo', false, false], output: ['foo', false, false]
    },
    { 
        asserts: ['foo', true, false]
    },

    // Valid input test cases
    {
        transforms: ['test', true, false],
        output: ['test', true, false]
    },
    {
        transforms: ['another', false, true],
        output: ['another', false, true]
    },
    { asserts: ['foo', 'true', false], error: true },
    { asserts: ['foo', false], error: true },
    { asserts: ['foo'], error: true },
    { asserts: ['foo', false, false, false], error: true }
)
