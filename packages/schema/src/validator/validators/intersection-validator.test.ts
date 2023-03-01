import { IntersectionValidator } from './intersection-validator'
import { ShapeValidator } from './shape-validator'

import { isBoolean, isNumber } from '@benzed/util'

import { TypeValidator } from './contract-validators'
import { testValidator } from '../../util.test'

//// Tests ////

const $number = new class Number extends TypeValidator<number>{
    isValid(input: unknown): input is number {
        return isNumber(input)
    }
}

const $boolean = new class Boolean extends TypeValidator<boolean> {
    isValid(input: unknown): input is boolean {
        return isBoolean(input)
    }
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
        error: 'bar must be Boolean' 
    },
    {
        transforms: { foo: 0, bar: true }
    },
    {
        asserts: { foo: 0, bar: true }
    },
    {
        asserts: { bar: true },
        error: 'foo must be Number'
    }
)

it('requires an intersection of object types', () => {
    // @ts-expect-error must be object types
    void new IntersectionValidator($number, $boolean) 
})