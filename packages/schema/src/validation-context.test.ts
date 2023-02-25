import { ValidationContext } from './validation-context'

import { it } from '@jest/globals'
import { nil } from '@benzed/util'
import { Node } from '@benzed/node'

//// Tests ////

describe('construct', () => {

    const context = new ValidationContext(10)

    it('sets input', () => {
        expect(context.input).toBe(10)
    })

    it('sets transformed', () => {
        expect(context.transformed).toBe(10)
    })

    it('sets key', () => {
        const contextWithoutKey = context
        expect(contextWithoutKey.key).toBe(nil)

        const contextWithKey = new ValidationContext('foo', { key: 0 })
        expect(contextWithKey.key).toBe(0)
    })

    it('transform is true by default', () => {
        expect(context.transform).toBe(true)
    })

})

describe('setOutput', () => {

    it('sets the result property to a provided output', () => {
        const context = new ValidationContext([10])
        context.setOutput([15])
        expect(context.result).toEqual({ output: [15] })
    })

})

describe('setError', () => {

    it('sets the result property to a validation error with the provided error detail', () => {
        const context = new ValidationContext(['ace'])
        context.setError('must be an array of numbers')
        expect(context.result).toEqual({ 
            error: 'must be an array of numbers'
        })
    })

})

describe('Node trait usage', () => {

    const value = { foo: 'bar' }
    const objCtx = new ValidationContext(value)

    const fooCtx = objCtx.pushSubContext(value.foo, 'foo')

    test('pushSubContext', () => { 
        expect(fooCtx.key).toEqual('foo')
        expect(fooCtx.transform).toEqual(true)
        expect(Node.getParent(fooCtx)).toBe(objCtx)
    })

    test('superContext', () => {
        expect(fooCtx.superContext).toBe(objCtx)
    })

    test('subContexts', () => {
        expect(objCtx.subContexts).toEqual({
            foo: fooCtx
        })
    })

})