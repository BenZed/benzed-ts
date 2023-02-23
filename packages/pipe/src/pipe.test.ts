import { Pipe, ParamPipe } from './pipe'

import { expectTypeOf } from 'expect-type'

import { it, describe, expect } from '@jest/globals'

/* eslint-disable 
    @typescript-eslint/restrict-plus-operands
*/

//// Setup ////

const x2 = (i: number): number => i * 2

//// Tests ////

it('create a pipe with multiple transforms', () => {
    const x32 = Pipe.from(x2,x2,x2,x2,x2) 
    expect(x32(1)).toEqual(32)
})

it('multiple transforms must have the same type', () => { 
    // @ts-expect-error mismatching input type
    void Pipe.from(x2, parseInt) 
})

describe('params', () => {

    type Incrementer = ParamPipe<number, number, [{ count: number }]>
    const i1: Incrementer = Pipe.from((i, ctx) => i + ctx.count)

    describe('infer param through from() signature', () => {
        const t1 = (i: number, ctx: { count: number }): number => i + ctx.count
        const p1 = Pipe.from(t1)
        expectTypeOf(p1).toEqualTypeOf<Incrementer>()
    
        const p2 = Pipe.from((i: number, ctx: { count: number }): number => i + ctx.count)
        expectTypeOf(p2).toEqualTypeOf<Incrementer>()
    
        const p3 = Pipe.from((i: number, ctx: { count: number }) => i + ctx.count)
        expectTypeOf(p3).toEqualTypeOf<Incrementer>()

        const p6 = Pipe.from((i: number) => i)
        expectTypeOf(p6).toEqualTypeOf<Pipe<number,number>>()

        const p7 = Pipe.from<number,number>(i => i)
        expectTypeOf(p7).toEqualTypeOf<Pipe<number,number>>()

    })

    describe('infer param through .to() signature', () => {

        const i2 = i1.to(i => i)
        expectTypeOf(i2).toEqualTypeOf<Incrementer>()

        const noop = Pipe.from((i: number) => i)
        const i3 = i1.to(noop)
        expectTypeOf(i3).toEqualTypeOf<Incrementer>()

        const i4 = i1.to((i, ctx) => i + ctx.count)
        expectTypeOf(i4).toEqualTypeOf<Incrementer>()
    })

    it('infer new param through .to() signature', () => {

        const noop = Pipe.from((i: number) => i)
        const i2 = noop.to(i1)
        expectTypeOf(i2).toEqualTypeOf<Incrementer>()

        const i3 = noop.to((i: number, ctx: { count: number }) => i + ctx.count)
        expectTypeOf(i3).toEqualTypeOf<Incrementer>()

        const i5 = noop.to(i => i * 2)
        expectTypeOf(i5).toEqualTypeOf<Pipe<number, number>>()
    })

    it('typesafe same through .to() signature', () => {

        const i2 = i1.to((i, ctx) => i + ctx.count)
        expectTypeOf(i2).toEqualTypeOf<Incrementer>()

        const i3 = i1.to(i => i)
        expectTypeOf(i3).toEqualTypeOf<Incrementer>()

        const i5 = i1.to<string>(i => `${i}`)
        expectTypeOf(i5).toEqualTypeOf<ParamPipe<number, string, [{ count: number }]>>()
    }) 

})

describe('binding', () => {

    it('creates a Pipe rather than a bound function', () => {
        const object = {
            scores: [] as number[],
            count: Pipe.from<void, number>(function (this: { scores: number[] }) {
                return this.scores.length
            })
        }
        const count = object.count = object.count.bind(object)

        expect(object.count).toBeInstanceOf(Pipe)
        expect(count()).toEqual(0)
    })

})

it('creating a pipe out of multiple pipes flattens the transforms', () => {
    const m1 = Pipe.from(x2, x2)
    const m2 = Pipe.from(x2, x2)

    const m3 = Pipe.from(m1, m2)
    expect([...m3]).toHaveLength(4)
})

describe('iterable', () => {
    const pow = Pipe.from((i: number) => i++).to(i => i * 2)
    
    it('iterates through each transform in the pipe', () => {
        expect([...pow]).toHaveLength(2)
    })
})

describe('.to()', () => {

    const parse = Pipe.from((i: string) => parseInt(i))
    const isPositiveDigit = parse.to(i => i > 0)

    it('apppends another transform method onto a pipe', () => {

        expect(isPositiveDigit('10')).toEqual(true)
        expect(isPositiveDigit('-10')).toEqual(false)

        expectTypeOf(isPositiveDigit).toEqualTypeOf<Pipe<string, boolean>>()

    })

    it('input type of the appendee transform must match pipe output', () => {
        // @ts-expect-error incorrect input type
        void parse.to((i: boolean) => !i)
    })

    it('immutable copy', () => {
        expect(parse).not.toBe(isPositiveDigit)
    })

})

describe('from()', () => {

    const parse = Pipe.from((i: string) => parseInt(i))
    const to = parse.from((i:boolean) => `${i ? 1 :0}`)

    it('prepends another transform method onto a pipe', () => {
        expect(to(true)).toEqual(1)
        expect(to(false)).toEqual(0)
        expectTypeOf(to).toEqualTypeOf<Pipe<boolean, number>>()
    })

    it('immutable copy', () => {
        expect(parse).not.toBe(to)
    })
})

describe('promises', () => {

    const async = Pipe.from((i: number) => Promise.resolve(i * 2))

    it('can\'t define input as promises', () => {
        // @ts-expect-error Pipe.from pipe input must be awaited
        const p = Pipe.from((p: Promise<number>) => p.then(n => n * 2))

        // @ts-expect-error Pipe.from param pipe must be awaited
        Pipe.from((i: Promise<number>, ctx: { foo: 'string '}) => [i, ctx.foo])

        Pipe.from((i: number) => Promise.resolve(i + 1))
        // @ts-expect-error Pipe.from.from pipe must be awaited
            .from((i: Promise<number>) => i.then(p => p + 1))

        // @ts-expect-error Pipe.from many pipes must be awaited
        Pipe.from((i: Promise<number>) => i.then(r => r * 2), (i: Promise<number>) => i.then(r => r * 2))

        Pipe.from((i: number, ctx: { invert: boolean }) => Promise.resolve(i * (ctx.invert ? -1 : 1)))
        // @ts-expect-error param pipe from pipe must be awaited
            .from((i: Promise<number>) => i.then(p = p + 1))

        Pipe.from((i: number, _by: number) => Promise.resolve(i / 2))
        // @ts-expect-error param  zpipe from pipe must be awaited
            .from((i: Promise<number>, by) => i.then(r => r * by))
    })

    it('async to Pipe', async () => {
    
        const toPipe = async.to(i => `${i}`)
        expect(await toPipe(10)).toEqual('20')
        expectTypeOf(toPipe).toEqualTypeOf<Pipe<number, Promise<string>>>()

    })

    it('async from Pipe', async () => {
        const fromPipe = async.from((i: number) => i * 2)
        expect(await fromPipe(10)).toEqual(40)

    })

    it('async to ParamPipe', async () => {
        const toParamPipe = async.to((i: number, ctx: { count: number }) => i + ctx.count)
        
        expect(await toParamPipe(10, { count: 5 })).toEqual(25)

        expectTypeOf(toParamPipe).toEqualTypeOf<ParamPipe<number, Promise<number>, [{ count: number }]>>()
    })

    it('param pipe to param pipe', async () => {

        const toCtxPipe = async.to((i: number, ctx: { by: number }) => i * ctx.by)
        const toNextCtxPipe = toCtxPipe.to(i => i * 10)

        expect(await toNextCtxPipe(10, { by: 100 })).toEqual(20000)
    })

    it('async outputs does not resolve to nested promises', async () => {
        const t1 = Pipe.from((i: number) => Promise.resolve(i * 2))
        const t2 = t1.to(t1)

        expectTypeOf(t2).toEqualTypeOf<Pipe<number, Promise<number>>>()
        expect(await t2(2)).toEqual(8)
    })

})

describe('flatten', () => {

    it('breaks a pipe into its transforms', () => {

        const x4 = Pipe.from(x2, x2)

        const x22 = Pipe.flatten([x4])
        expect(x22).toHaveLength(2)
    })

    it('respects binding', () => {

        const inc = Pipe.from(function (this: { state: number }, input: number) {
            this.state += input
            return this.state
        }).bind({ state: 0 })

        expect(inc(1)).toEqual(1)
        expect(inc(1)).toEqual(2)

        const shout = Pipe.from(function (this: { suffix: string }, input: string) {
            return `${input}${this.suffix}`
        }).bind({ suffix: '!' })

        expect(shout('sup')).toEqual('sup!')
        
        const incShout = inc.to(i => `${i}`)
            .to(shout)
            .to(i => `"${i}"`)

        expect(incShout(1)).toEqual('"3!"')

        // requires that they be flattened into 2 bound pipes 
        // to preserve param
        expect(incShout.transforms).toHaveLength(2)        
    })

    it('appending pipes flattens all of the transforms into a single pipe', () => {
        const m1 = Pipe.from(x2, x2)
        const m2 = Pipe.from(x2, x2)
    
        const m3 = Pipe.from(m1, m2)
        expect([...m3]).toHaveLength(4)
    
        expect(m3(2)).toEqual(32)
    })
})
