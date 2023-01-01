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
    
    const diff = Execute.append(inc, (i, ctx) => i - ctx.input)
    expect(diff(2)).toEqual(1)
})

it('context has access to module interface', () => {

    const zero = Node.build(
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

    const node = Node.build( 
        {
            zero
        },
        Module.data(0 as const)  
    )

    const [ , execute ] = node.nodes.zero.modules

    expect(execute(1)).toEqual(Module.data(1))
})

test('append()', () => {

    const n1 = Node.build(
        Module.data([] as string[]),
        Module.execute((i: string, ctx) => ctx
            .node
            .assertModule((m): m is Data<string[]> => isArray(m.data, isString))
            .data
            .includes(i)
        )
    )

    const n2 = n1.setModule(1, exec => Execute.append(exec, i => `data has string: ${i}`))

    expect(n2.modules[1]('fun')).toEqual('data has string: false')
})

test('promises resolve before next execution', () => {
    const x2 = Module.execute((i: number) => Promise.resolve(i * 2))
    const x4 = Execute.append(x2, i => i * 2)
    return expect(x4(1)).resolves.toBe(4)
})

test('prepend()', () => {
    const x10 = Module.execute((i: number) => i * 10)
    const strToX10 = Execute.prepend(x10, (i: string) => parseInt(i))
    expect(strToX10('10')).toEqual(100)
})

test('.find as Module', () => {
    const shout = Node.build(Module.execute((i: string) => i + '!'))
    const [exec] = shout.findModules(Module)
    expect(exec).toBeInstanceOf(Execute)
})

test('extendable', () => {

    interface By {
        by: number
    }

    class Multiply<I,O> extends Execute<I, O, By> {

        append<Ox>(hook: ExecuteHook<Awaited<O>, Ox, By>): Multiply<I, ResolveAsyncOutput<O, Ox>> {
            return Execute.append(this, hook) as Multiply<I, ResolveAsyncOutput<O, Ox>>
        }

        prepend<Ix>(hook: ExecuteHook<Ix, I, By>): Multiply<Ix, O> {
            return Execute.prepend(this, hook) as Multiply<Ix, O>
        }
    }

    const x = new Multiply((i: number, ctx) => i * ctx.by)
    expect(x(5, { by: 2 })).toEqual(10)
    expect(x).toBeInstanceOf(Multiply)

    const xr = x.append((o, ctx) => `${ctx.input} x ${ctx.by} equals ${o}`)
    expect(xr(10, { by: 2 })).toEqual('10 x 2 equals 20')
    expect(xr).toBeInstanceOf(Multiply)
})

it('ctx is mutable', () => {
    const exec = new Execute((i: string, ctx: { history: string[] }) => ctx.history.push(i) ?? i)
    const mExec = Execute.append(exec, (_, ctx) => ctx.history.length)
    expect(mExec('ace', { history: [] })).toEqual(1)
})