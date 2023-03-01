import { isBoolean, isString } from '@benzed/util'

import { ShapeValidator } from './shape-validator'
import { TypeValidator } from '../validators'
import { testValidator } from '../../util.test'

import { ValidateOutput } from '../../validate'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const $boolean = new class Boolean extends TypeValidator<boolean> {
    isValid = isBoolean
}

const $string = new class String extends TypeValidator<string> {
    isValid = isString
}

const $todo = new ShapeValidator({
    description: $string,
    completed: $boolean
})

//// Tests ////

it('output type', () => {
    type Todo = ValidateOutput<typeof $todo>
    expectTypeOf<Todo>().toEqualTypeOf<{
        description: string
        completed: boolean
    }>()
})

testValidator<object, { description: string, completed: boolean }>( 
    $todo,
    {
        transforms: { description: 'hey', completed: 'yo' },
        error: 'completed must be Boolean'
    },
    {
        transforms: { description: 1, completed: 'yo' },
        error: 'description must be String'
    },
    {
        title: 'removes errant keys on transform',
        transforms: { description: 'description', completed: true, cake: true },
        output: { description: 'description', completed: true }
    },
    {
        transforms: { description: 'description', completed: true }
    },
    {
        title: 'throws on invalid keys',
        asserts: { description: 'description', completed: true, cake: true },
        error: 'invalid keys: cake'
    }
)
