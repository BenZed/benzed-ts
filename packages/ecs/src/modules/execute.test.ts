import { isArray, isString, ResolveAsyncOutput } from '@benzed/util'
import { it, expect, test } from '@jest/globals'

import { Data } from './data'
import { Execute, ExecuteHook } from './execute'

import { Module } from '../module'
import { Node } from '../node'

//// Tests ////

it('callable module that takes a transform method', () => {
    const x2 = new Execute((i: number) => i * 2)
    expect(x2(4)).toEqual(8)
})

it('provide arbitrary data to context', () => {
    const multiply = new Execute((i: number, ctx: { by: number }) => i * ctx.by)
    multiply(2, { by: 5 })
})

it('no void context type error', () => {

    const inc = new Execute((i: number) => i + 1)

    expect(inc(1)).toEqual(2)
    
    const diff = inc.appendHook((i, ctx) => i - ctx.input)
    expect(diff(2)).toEqual(1)
})

it('context has access to module interface', () => {

    const node = Node.create( 
        {
            zero: Node.create(
                Module.data(1 as const),
                Module.execute((i: number, ctx) => ctx
                    .node
                    .root
                    .assertModule
                    .inDescendents(
                        Module.data(i)
                    )
                ) 
            )
        },
        Module.data(0 as const)  
    )

    const [ , execute ] = node.nodes.zero.modules

    expect(execute(1)).toEqual(Module.data(1))
})

test('append()', () => {

    const n1 = Node.create(
        Module.data([] as string[]),
        Module.execute((i: string, ctx) => ctx
            .node
            .assertModule((m): m is Data<string[]> => isArray(m.data, isString))
            .data
            .includes(i)
        )
    )

    const n2 = n1.setModule(1, exec => exec.appendHook(i => `data has string: ${i}`))

    expect(n2.modules[1]('fun')).toEqual('data has string: false')
})

test('promises resolve before next execution', () => {
    const x2 = Module.execute((i: number) => Promise.resolve(i * 2))
    const x4 = x2.appendHook(i => i * 2)
    return expect(x4(1)).resolves.toBe(4)
})

test('prepend()', () => {
    const x10 = Module.execute((i: number) => i * 10)
    const strToX10 = x10.prependHook((i: string) => parseInt(i))
    expect(strToX10('10')).toEqual(100)
})

test('.find as Module', () => {
    const shout = Node.create(Module.execute((i: string) => i + '!'))
    const [exec] = shout.findModules(Module)
    expect(exec).toBeInstanceOf(Execute)
})

test('extendable', () => {

    interface By {
        by: number
    }

    class Multiply<I,O> extends Execute<I, O, By> {

        appendHook<Ox>(hook: ExecuteHook<Awaited<O>, Ox, By>): Multiply<I, ResolveAsyncOutput<O, Ox>> {
            return super.appendHook(hook)
        }

        prependHook<Ix>(hook: ExecuteHook<Ix, I, By>): Multiply<Ix, O> {
            return super.prependHook(hook)
        }
    }

    const x = new Multiply((i: number, ctx) => i * ctx.by)
    expect(x(5, { by: 2 })).toEqual(10)

    const xr = x.appendHook((o, ctx) => `${ctx.input} x ${ctx.by} equals ${o}`)

    expect(xr(10, { by: 2 })).toEqual('10 x 2 equals 20')
})

it('ctx is mutable', () => {

    const exec = new Execute((i: string, ctx: { history: string[] }) => ctx.history.push(i) ?? i)
        .appendHook((_, ctx) => ctx.history.length)

    expect(exec('ace', { history: [] })).toEqual(1)

})