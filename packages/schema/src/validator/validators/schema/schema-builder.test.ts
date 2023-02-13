import { isNumber } from '@benzed/util'

import TypeValidator from '../type-validator'
import { SchemaBuilder } from './schema-builder'
import SubContractValidator from './sub-validator'

import { testValidator } from '../../../util.test'

//// Tests ////

const $number = new class Number extends TypeValidator<number> {
    name = 'Number'
    isValid = isNumber
}

const $positive = new class Positive extends SubContractValidator<number> {
    readonly enabled = true
    readonly transform = (i: number): number => Math.max(i, 0)
}

const $schema = new SchemaBuilder(
    $number,
    {
        positive: $positive
    }
)

describe(`${$schema.name} validator tests`, () => {

    testValidator(
        $schema,
        { transforms: -1, output: 0 },
    )

    testValidator(
        $schema.asserts(i => i % 2 === 0, 'Must be even'),
        { asserts: 2 },
        { asserts: 3, error: 'Must be even'}
    )

})