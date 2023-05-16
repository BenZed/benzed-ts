
import { it, expect } from '@jest/globals'
import { is } from './index'

it('isErrorOrArrayOfTodo', () => {
    const isSerialInput = is
        .number.or.string
        .or
        .arrayOf(is.number.or.string)

    isSerialInput.output satisfies number | string | (number | string)[]
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

    isTodo.output satisfies {
        readonly completed: boolean
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

    isName.output satisfies {
        readonly firstName: string
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

    isAnonymous.output satisfies {
        readonly age: number
    }

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

    isAsyncState.output satisfies {
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

    isFoo.output satisfies Foo 
})