import { describe, expect, test } from '@jest/globals'
import ValidationError from './validation-error'

test('can be constructed with value, key, and detail', () => {
    const error = new ValidationError({
        value: { foo: 1 },
        key: 'bar',
        detail: 'invalid type'
    })
    expect(error.value).toEqual({ foo: 1 })
    expect(error.key).toEqual('bar')
    expect(error.detail).toEqual('invalid type')
    expect(error.message).toEqual('Property bar invalid type')
})

test('can be constructed with value and detail only', () => {
    const error = new ValidationError({
        value: { foo: 1 },
        detail: 'invalid object'
    })
    expect(error.value).toEqual({ foo: 1 })
    expect(error.key).toBeUndefined()
    expect(error.detail).toEqual('invalid object')
    expect(error.message).toEqual('Invalid object')
})

test('can be constructed with value and key only', () => {
    const error = new ValidationError({
        value: [1, 2, 3],
        key: 1
    }) 
    expect(error.value).toEqual([1, 2, 3])
    expect(error.key).toEqual(1)
    expect(error.detail).toBeUndefined()
    expect(error.message).toEqual('Index 1 validation failed') 
})

test('can be constructed with value only', () => {
    const error = new ValidationError({
        value: 'foo'
    })
    expect(error.value).toEqual('foo')
    expect(error.key).toBeUndefined()
    expect(error.detail).toBeUndefined()
    expect(error.message).toEqual('Validation failed')
})

describe('detail object', () => {

    const error = new ValidationError({
        value: {
            foo: 100,
            bar: {
                baz: 100
            }
        },
        detail: {
            foo: 'error message for foo',
            bar: {
                baz: 'error message for baz'
            }
        }
    })

    test('default message, detail object', () => {
        expect(error.message).toEqual('Validation failed')
        expect(typeof error.detail).toBe('object')
    })
})
describe('detail array', () => {

    const error = new ValidationError({
        value: [
            { foo: 10 },
            {
                bar: {
                    baz: true 
                }
            }
        ],
        detail: [
            {
                foo: 'error message for foo'
            },
            {
                bar: {
                    baz: 'error message for baz'
                }
            }
        ]
    })

    test('default message, detail object', () => {
        expect(error.message).toEqual('Validation failed')
        expect(typeof error.detail).toBe('object')
    })
})