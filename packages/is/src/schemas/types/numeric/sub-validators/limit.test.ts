import { Limit } from './limit'

import { Validator } from '@benzed/schema'

import { testValidator } from '../../../../util.test'

import { describe } from '@jest/globals'

//// Tests ////

const { applyState: apply } = Validator

describe('number', () => {

    const $minNum = new Limit<number>('min')

    testValidator(
        apply($minNum, { value: 5 }),
        { asserts: 6 },
        { asserts: 5, error: 'must be above 5' },
    )

    testValidator(
        apply($minNum, { value: 5, inclusive: true }),
        { asserts: 5 },
        { asserts: 4, error: 'must be above or equal 5' },
    )

    const $maxNum = new Limit<number>('max')

    testValidator(
        apply($maxNum, { value: 5 }),
        { asserts: 4 },
        { asserts: 5, error: 'must be below 5' },
    )

    testValidator(
        apply($maxNum, { value: 5, inclusive: true }),
        { asserts: 4 },
        { asserts: 5 },
        { asserts: 6, error: 'must be below or equal 5' },
    )

})

describe('bigint', () => {

    const $minBigint = new Limit<bigint>('min')

    testValidator(
        apply($minBigint, { value: 5n }),
        { asserts: 6n },
        { asserts: 5n, error: 'must be above 5' },
    )

    testValidator(
        apply($minBigint, { value: 5n, inclusive: true }),
        { asserts: 5n },
        { asserts: 4n, error: 'must be above or equal 5' },
    )

    const $maxBigInt = new Limit<bigint>('max')

    testValidator(
        apply($maxBigInt, { value: 5n }),
        { asserts: 4n },
        { asserts: 5n, error: 'must be below 5' },
    )

    testValidator(
        apply($maxBigInt, { value: 5n, inclusive: true }),
        { asserts: 4n },
        { asserts: 5n },
        { asserts: 6n, error: 'must be below or equal 5' },
    )

})

describe('arrays', () => {

    const $minLength = new Limit<{ length: number }>('min')

    testValidator(
        apply($minLength, { value: { length: 5 } }),
        { asserts: [1,2,3,4,5,6] },
        { asserts: [1,2,3,4,5], error: 'length must be above 5' },
    )

})
