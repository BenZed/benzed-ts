import { expect, test } from '@jest/globals'
import ValidationContext from './validation-context'
import ValidationError from './validation-error'

//// Ferns Grow ////

test('constructed with a validation context', () => {
    const ctx = new ValidationContext({ foo: 1 }, { key: 'bar' })
    const error = new ValidationError(ctx)

    expect(error.json).toEqual('Validation incomplete')
    expect(error.message).toEqual('Validation incomplete')
})

test('uses key and result to create message', () => {

    const ctx = new ValidationContext(10, { key: 'value' }).setError('must be a string')
    const error = new ValidationError(ctx)

    expect(error.message).toBe('value must be a string')
})

test('uses path in message when sub contexts are involved', () => {

    const ctx = new ValidationContext({ 
        complete: false 
    }, { key: 'todo' })

    ctx.pushSubContext(false, 'complete').setError('must be true')

    const error = new ValidationError(ctx)
    expect(error.message).toBe('todo.complete must be true')
})

test('path is formatted', () => {

    const $$value = Symbol('value')

    const value = { 
        bar: [{ [$$value]: -1 }]
    }

    const ctx = new ValidationContext(value, { key: 'foo' })
    ctx.pushSubContext(value.bar, 'bar')
        .pushSubContext(value.bar[0], 0)
        .pushSubContext(value.bar[0][$$value], $$value)
        .setError('must be above 0')
    
    const error = new ValidationError(ctx)
    expect(error.message).toBe('foo.bar[0][$$value] must be above 0')
})

test('simple json property', () => {

    const ctx = new ValidationContext(10, { key: 'value' }).setError('must be a string')

    const error = new ValidationError(ctx)
    expect(error.json).toEqual('must be a string')
})

test('array json property', () => {

    const ctx = new ValidationContext([-1,1,2])
    ctx.pushSubContext(-1, 0).setError('must be positive')
    ctx.pushSubContext(1, 1)
    ctx.pushSubContext(2, 2)

    const error = new ValidationError(ctx)
    expect(error.message).toBe('index 0 must be positive')
    expect(error.json).toEqual(['must be positive', null, null])
})

test('object json property', () => {

    const ctx = new ValidationContext({ foo: 'bar' })
    ctx.pushSubContext('bar', 'foo').setError('must be capitalized')

    const error = new ValidationError(ctx)
    expect(error.message).toBe('foo must be capitalized')
    expect(error.json).toEqual({ foo: 'must be capitalized' })
})

test('complex json property', () => {

    const $$key = Symbol('key')

    const data = { 
        ace: [0, 1, 2, 3, { [$$key]: 0 }]
    }

    const ctx = new ValidationContext(data)

    ctx.pushSubContext(data.ace, 'ace')
        .pushSubContext(data.ace[4], 4)
        .pushSubContext(data.ace[4][$$key], $$key)
        .setError('must not be zero')

    const error = new ValidationError(ctx)

    expect(error.message).toBe('ace[4][$$key] must not be zero')
    expect(error.json).toEqual({
        ace: [{ [$$key]: 'must not be zero' }]
    })
})