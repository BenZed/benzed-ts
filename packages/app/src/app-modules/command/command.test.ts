import { $ } from '@benzed/schema'
import { Module } from '@benzed/ecs'
import { toAsync } from '@benzed/async'
import { keysOf, isPromise, through } from '@benzed/util'

import { it, test, describe, expect } from '@jest/globals'

import { HttpMethod } from '../../util'
import { RequestHandler } from '../request-handler'

import { Command, CommandProvisions } from './command'

import { expectTypeOf } from 'expect-type'

//// Tests ////

describe('create methods', () => {

    it('.create()', () => {
        const request = Command
            .create(HttpMethod.Get, {})
            .req.fromData({})
        expect(request)
            .toHaveProperty('url', '/')
    })

    it('.get()', () => {
        const get = Command.get({})
        expect(get.method).toEqual(HttpMethod.Get)
    })

    it('.post()', () => {
        const post = Command.post({})
        expect(post.method).toEqual(HttpMethod.Post)
    })

    it('.put()', () => {
        const put = Command.put({})
        expect(put.method).toEqual(HttpMethod.Put)
    }) 

    it('.patch()', () => {
        const patch = Command.patch({})
        expect(patch.method).toEqual(HttpMethod.Patch)
    })

    it('.delete()', () => {
        const del = Command.delete({})
        expect(del.method).toEqual(HttpMethod.Delete)
    })

})

describe('isCommand', () => {
    it('returns true if input is a command', () => {
        expect(Command.isCommand(Command.get({}))).toEqual(true)
    })

    it('returns false if input is not a command', () => {
        expect(Command.isCommand(Module.data(1))).toEqual(false)
        expect(Command.isCommand([])).toEqual(false) 
        expect(Command.isCommand(1)).toEqual(false)
        expect(Command.isCommand(Function)).toEqual(false)
    })
})

describe('request shortcuts', () => {

    const cmd = Command.create(HttpMethod.Post, { id: $.string })

    test('.req', () => {
        expect(cmd.req).toBeInstanceOf(RequestHandler)
        expect(cmd.req.fromData({ id: 'id' })).toEqual({
            method: HttpMethod.Post,
            url: '/',
            body: {
                id: 'id'
            }
        })
        expect(cmd.req.match({ method: HttpMethod.Post, url: '/', body: { id: '2' }}))
            .toEqual({
                id: '2'
            })
    })

    test('.setReq()', () => {

        const cmd2 = cmd.setReq(req => req.setUrl`/ace`)
        expect(cmd2).not.toEqual(cmd)
        expect(cmd2.req.fromData({ id: 'id' })).toEqual({
            method: HttpMethod.Post,
            url: '/ace',
            body: {
                id: 'id'
            }
        })

    })

    test('.method', () => {
        expect(cmd.method).toEqual(HttpMethod.Post)
    })
 
    test('.schema', () => {
        expect(cmd.schema).toEqual(cmd.req.schema)
    })

    test('.setSchema()', () => {
        const cmd2 = cmd.setMethod(HttpMethod.Put)
        expect(cmd2.method).toEqual(HttpMethod.Put)
        expect(cmd2).not.toEqual(cmd)
    })

})

describe('execute shortcuts', () => {

    const cmd = Command.create(
        HttpMethod.Get, 
        { id: $.string }, 
        i => ({ ...i, found: true })
    )

    test('appendHook()', async () => {

        const cmdA = cmd.appendHook(i => ({
            ...i,
            timestamp: Date.now()
        }))

        expectTypeOf(cmdA)
            .toEqualTypeOf<Command<{ id: string }, { id: string, found: true, timestamp: number }, CommandProvisions>>()
        
        const output = await cmdA({ id: '0' })

        expect(output).toEqual({
            id: '0',
            found: true,
            timestamp: expect.any(Number)
        })
        expectTypeOf(output).toEqualTypeOf<{
            id: string
            found: true
            timestamp: number
        }>()
    })

    test('prependHook()', async () => {
        const cmdP = cmd.prependHook(i => i)
        const output = await cmdP({ id: '1' })

        expect(output).toEqual({ id: '1', found: true })
        expectTypeOf(output).toEqualTypeOf<{
            id: string
            found: true 
        }>()
    })

    test('prependHook() with schema', async () => {  
        const cmdP = cmd.prependHook({ id: $.string, bone: $.string }, through)
        const output = await cmdP({ id: 'zero', bone: 'collar' })
        expect(output).toEqual({ id: 'zero', found: true }) 
    })

})

describe('async output', () => {

    test('json input', () => {
        // @ts-expect-error async input not allowed
        Command.create<Promise<{ id: string }>>(
            HttpMethod.Post, 
            $.unknown
        )
    })

    test('json output', () => {
        Command.create(
            HttpMethod.Post, 
            // @ts-expect-error async output not allowed 
            $.typeOf((i): i is Promise<{ id: string }> => isPromise<{ id: string }>(i))
        )
    })

    for (const useCreate of [true, false] as const) {
        for (const httpMethod of keysOf(HttpMethod)) {
            if (httpMethod === 'Options')
                continue 

            it(`.${httpMethod.toLowerCase()}() execute async output`, async () => {

                const $foo = $({ foo: $.string })

                const cmd = useCreate
                    ? Command.create(HttpMethod[httpMethod], $foo, toAsync)
                    : Command[httpMethod.toLowerCase() as Lowercase<typeof httpMethod>]($foo, toAsync)
    
                const output = cmd({ foo: 'bar' }) 
                expect(output).toBeInstanceOf(Promise)
                
                await expect(output).resolves.toEqual({ foo: 'bar' })
                expectTypeOf(cmd)
                    .toEqualTypeOf<Command<{ foo: string }, { foo: string }, CommandProvisions>>()
            })
            break
        } 
    }

    test('appendHook async output', async () => {
        const command = Command
            .create(HttpMethod.Options, { foo: $.string, bar: $.number }, i => ({ ...i, got: true }))
            .appendHook(toAsync)

        const output = command({ foo: 'string', bar: 10 })
        expect(output).toBeInstanceOf(Promise)

        await expect(output).resolves.toEqual({ foo: 'string', bar: 10, got: true })
        expectTypeOf(command)
            .toEqualTypeOf<Command<{ foo: string, bar: number }, { foo: string, bar: number, got: true }, CommandProvisions>>()
    })

    test('prependHook async output', async () => {

        const command = Command
            .create(HttpMethod.Options, { foo: $.string, bar: $.number }, i => ({ ...i, got: true }))
            .prependHook(toAsync)

        const output = command({ foo: 'string', bar: 10 })
        expect(output).toBeInstanceOf(Promise)

        await expect(output).resolves.toEqual({ foo: 'string', bar: 10, got: true })
        expectTypeOf(command)
            .toEqualTypeOf<Command<{ foo: string, bar: number }, { foo: string, bar: number, got: true }, CommandProvisions>>()
    })

    test('prependHook with schema async output', async () => {

        const $true = $(true) 

        const command = Command
            .get({ id: $.number }, ({ id }) => ({ id }))
            .prependHook({ id: $.number, prepended: $true }, toAsync)

        const output = command({ id: 0, prepended: true }) 
        expect(output).toBeInstanceOf(Promise) 

        await expect(output).resolves.toEqual({ id: 0 })
        expectTypeOf(command)
            .toEqualTypeOf<Command<{ id: number, prepended: true }, { id: number }, CommandProvisions>>()
    })

})
