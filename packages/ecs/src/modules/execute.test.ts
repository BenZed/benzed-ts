import { isArray, isString } from '@benzed/util'

import { Execute, ExecuteContext } from './execute'
import { Module } from '../module'
import { Data } from './data'
import { Node } from '../node'

it('callable module that takes a transform method', () => {
    const x2 = new Execute((i: number) => i * 2)
    expect(x2(4)).toEqual(8)
})

it('provide arbitrary data to context', () => {
    const multiply = new Execute((i: number, ctx: { data: number }) => i * ctx.data)
    multiply(2, 5)
})

it('context has access to module interface', () => {

    const node = Node.from( 
        Module.data(0 as const),
        Node.from(
            Module.data(1 as const),
            Module.execute((i: number, ctx: { parent: Module, root: Module }) => 
                ctx.root
                    .assert()
                    .inDescendents(
                        Module.data(i)
                    )
            ) 
        ) 
    )

    const data = node.get(1).get(1)(1)
    expect(data).toEqual(Module.data(1))
})

it('gives parent node a callable signature', () => {
    const x2 = Node.from(Module.execute((i: number) => i * 2))
    expect(x2(2)).toEqual(4)
})

test('append()', () => {

    const n1 = Node.from(
        Module.data([] as string[]),
        Module.execute((i: string, ctx: ExecuteContext<void>) => 
            ctx.find
                .require
                .inSiblings((m): m is Data<string[]> => isArray(m.data, isString))
                .data
                .includes(i)
        )
    )

    const n2 = n1.set(1, exec => exec.append(i => `data has string: ${i}`))
    expect(n2.get(1)('fun')).toEqual('data has string: false')
})

test('promises resolve before next execution', () => {

    const x2 = Module.execute((i: number) => Promise.resolve(i * 2))
    const x4 = x2.append(i => i * 2)

    return expect(x4(1)).resolves.toBe(4)
})

test('prepend()', () => {
    const x10 = Module.execute((i: number) => i * 10)
    const strToX10 = x10.prepend((i: string) => parseInt(i))
    expect(strToX10('10')).toEqual(100)
})

test('.find as Module', () => {
    const shout = Node.from(Module.execute((i: string) => i + '!'))
    const [exec] = shout.find.all(Module)
    expect(exec).toBeInstanceOf(Execute)
})
