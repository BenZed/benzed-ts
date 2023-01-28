import { validatorFrom } from './validator-from'

import { test } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import Validator from './validator'

//// Tests ////

test('ensure validator from input', () => {

    const v1 = validatorFrom({
        transform: (i: number) => `${i}`,
        isValid: () => true 
    })

    expectTypeOf(v1).toEqualTypeOf<Validator<number,string>>()

    const v2 = validatorFrom(v1)
    expect(v2).toEqual(v1)
})
