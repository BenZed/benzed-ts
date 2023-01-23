import { safeJsonStringify } from '@benzed/util'

import { Validate, ValidateOptions } from './validate'

import { test, it, expect, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'

//// Tests ////

const testValidator = <I,O>(
    validator: Validate<I,O>, 
    input: I,
    output: O, 
    transform: boolean, 
    error?: string
): void => {

    describe(`Validator ${validator.name}`, () => {

        it(`transforms ${input} to ${output}`, () => {

        })

    })

}

describe(Validate.name, () => {

    const parse = (i: string, options?: ValidateOptions): number => {
    }

    test('takes an input, receive and output', () => {
        const parse = (i => parseInt(i)) satisfies Validate<string, number>
    })

    test('takes an input, optionally validation options and returns and output', () => {
        expectTypeOf<Validate<string, number>>()
            .toMatchTypeOf<(i: string, options?: ValidateOptions) => number>()

        const parse = (i => parseInt(i)) satisfies Validate<string, number>

    })

})

const isValid = <I,O extends I>(validate: Validate<I,O>) => (i: I): i is O => {
    try {
        validate(i, { transform: false })
        return true
    } catch {
        return false
    }
}