
import { test, describe, it, expect } from '@jest/globals'
import { satisfies } from 'semver'

import { Is, is, IsType, Optional } from './index'
import { ArrayOf, Shape, Number } from './schemas'

it('is.string', () => {
    const name = localStorage.getItem('name')

    if (is.string(name))
        console.log(`Welcome back, ${name}`)
})

it('typeof isVectory', () => {
    const isVector = is({ x: is.number, y: is.number })

    type Vector = typeof isVector.type
})

it('typeof isVectory', () => {
    const isVector = is({
        x: is.number,
        y: is.number
    }) satisfies IsType<{ x: number, y: number }>
})

it('isTodo', () => {
    const isTodo = is({
        completed: is.readonly.boolean,
        description: is.readonly.string
    })

    const { validate: Todo } = isTodo

    const isTodoOrArrayOfTodos = is(Todo).or.arrayOf(Todo)
})

it('isErrorOrArrayOfTodos', () => {
    expect('ace').toEqual(expect.any(String))
    const isSerialInput = is
        .number.or.string
        .or
        .arrayOf(is.number.or.string)

    isSerialInput.type satisfies number | string | (number | string)[]
})

it('isArrayOfReadOnlyVectory', () => {

    const isVector = is({
        x: is.number,
        y: is.number
    })

    const isArrayOfReadOnlyVector = is.optional.arrayOf(isVector)

    isArrayOfReadOnlyVector satisfies Is<Optional<ArrayOf<Shape<{
            x: Number;
            y: Number;
        }>>>>

    isArrayOfReadOnlyVector.type satisfies 
    { readonly x: number, readonly y: number }[] | undefined
})


it('isReadonlyVectors', () => {

    abstract class Shape {
        abstract get edges(): number
    }
    
    class Square extends Shape {
        get edges(): number {
            return 4
        }
    }

    const square = { edges: 4 }
    expect(square instanceof Square).toBe(false)
    
    square satisfies Square // obviously no error
})