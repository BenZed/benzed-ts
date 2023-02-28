import { IntersectionValidator } from './intersection-validator'
import { ShapeValidator } from './shape-validator'

import { Trait } from '@benzed/traits'
import { isBoolean, isNumber } from '@benzed/util'

import { TypeValidator } from './contract-validators'
import { ValidateImmutable } from '../../traits'
import { testValidator } from '../../util.test'

//// Tests ////

const $number = new class Number extends Trait.add(TypeValidator<number>, ValidateImmutable) {
    isValid(input: unknown): input is number {
        return isNumber(input)
    }
    override readonly name = 'Number'

    message = 'must be a number'
}

const $boolean = new class Boolean extends Trait.add(TypeValidator<boolean>, ValidateImmutable) {
    isValid(input: unknown): input is boolean {
        return isBoolean(input)
    }
    override readonly name = 'Boolean'

    message = 'must be a boolean'
}

const $foo = new ShapeValidator({
    foo: $number
})

const $bar = new ShapeValidator({
    bar: $boolean
}) 

const $fooBar = new IntersectionValidator($foo, $bar)

testValidator<object,object>(
    $fooBar,
    {
        transforms: { foo: 0 },
        error: 'bar must be a boolean' 
    },
    {
        transforms: { foo: 0, bar: true }
    },
    {
        asserts: { foo: 0, bar: true }
    },
    {
        asserts: { bar: true },
        error: 'foo must be a number'
    }
)