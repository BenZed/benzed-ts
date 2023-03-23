
import { test, describe, it, expect } from '@jest/globals'
import { Is, is, IsType, Optional, Validator } from './index'
import { ArrayOf, String, Shape, Number } from './schemas'

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


    const isVector = is({ x: is.number, y: is.number })

    const isNotVector = is.not(isVector)
    
    is.not(isNotVector).type satisfies typeof isVector.type

    is.optional.arrayOf(is.string).readonly

        .type satisfies undefined | readonly string[]

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

it('readonly shape', () => {

    const isTodo = is.readonly({
        completed: is.boolean,
        description: is.string
    })

    isTodo.type satisfies {
        readonly completed: boolean,
        readonly description: string
    }
})

it('isPerson', () => {

    const isLettersOnly = is.string
    const isAboveZero = is.integer

    const isPerson = is.readonly({
        firstName: isLettersOnly,
        lastName: isLettersOnly,
        title: is.optional.string,
        age: isAboveZero,
        salary: isAboveZero
    })

    const isName = isPerson.pick('firstName', 'lastName')

    isName.type satisfies {
        readonly firstName: string,
        readonly lastName: string
    }

})

it('isPerson', () => {

    const isLettersOnly = is.string
    const isAboveZero = is.integer

    const isPerson = is.readonly({
        firstName: isLettersOnly,
        lastName: isLettersOnly,
        title: is.optional.string,
        age: isAboveZero,
        salary: isAboveZero
    })

    const isAnonymous = isPerson.omit('firstName', 'lastName', 'title')

    isAnonymous.type satisfies {
        readonly age: number
    }

})

it('isEmployee', () => {

    const isLettersOnly = is.string
    const isAboveZero = is.integer

    const isPerson = is.readonly({
        firstName: isLettersOnly,
        lastName: isLettersOnly,
        title: is.optional.string,
        age: isAboveZero,
    })

    const isEmployee = isPerson.and({
        salary: isAboveZero.validate
    })

    const isAdult = isPerson.property('age', age => age.min(19))

    const isDoctor = isEmployee
        .property('title', () => is('Md', 'Phd').validate)
        .omit('lastName')

    const isZero = is(0)

    const isRef = <V extends Validator>(isType: { validate: V }): Is<Shape<{ current: V }>> => 
        is({ current: isType.validate }) as any

    const isStringRef = isRef(is.string)
})

it('isAsyncState', () => {

    const isAsyncState = 
        is({
            type: 'resolving' as const
        },
        {
            type: 'rejected' as const,
            error: is.error
        },
        {
            type: 'resolved' as const,
            value: is.unknown
        })


    isAsyncState.type satisfies {
        type: 'resolved'
        value: unknown
    } | {
        type: 'resolving'
    } | {
        type: 'rejected'
        error: Error
    }
})

it('isFoo', () => {

    class Foo {
        bar = 'bar'
    }

    const isFoo = is(Foo)

    isFoo.type satisfies Foo 
})