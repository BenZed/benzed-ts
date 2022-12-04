import { Pipe, ContextPipe } from './pipe'

import { expectTypeOf } from 'expect-type'

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

it('create a pipe with primitive context', () => {
    
    const parse = Pipe.from(parseInt)

    expect(parse('100', undefined)).toEqual(100)
    expectTypeOf(parse).toEqualTypeOf<ContextPipe<string, number, number | undefined>>()
})

it('multiple transforms must have the same type', () => {
    // @ts-expect-error mismatching input type
    void Pipe.from(x2, parseInt)
})

describe('context', () => {

    type Incrementer = ContextPipe<number, number, { count: number }>
    const i1: Incrementer = Pipe.from((i, ctx) => i + ctx.count)

    describe('infer context through from() signature', () => {
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

    describe('convert this methods', () => {
    
        function add(this: { count: number }, input: number): number {
            return input + this.count
        }
        const p4 = Pipe.convert(add)
        expectTypeOf(p4).toEqualTypeOf<Incrementer>()
    
        const p5 = Pipe.convert(function (this: { count: number }, input: number): number {
            return input + this.count
        })
        expectTypeOf(p5).toEqualTypeOf<Incrementer>()
    
        const p6 = Pipe.from((i: number) => i)
        expectTypeOf(p6).toEqualTypeOf<Pipe<number,number>>()

        const p7 = Pipe.from<number,number>(i => i)
        expectTypeOf(p7).toEqualTypeOf<Pipe<number,number>>()

        const p8 = Pipe.convert<number, number, { count: number }>(function (i) {
            return i + this.count 
        })
        expectTypeOf(p8).toEqualTypeOf<Incrementer>()
    })

    describe('infer context through .to() signature', () => {

        const i2 = i1.to(i => i)
        expectTypeOf(i2).toEqualTypeOf<Incrementer>()

        const noop = Pipe.from((i: number) => i)
        const i3 = i1.to(noop)
        expectTypeOf(i3).toEqualTypeOf<Incrementer>()

        const i4 = i1.to((i, ctx) => i + ctx.count)
        expectTypeOf(i4).toEqualTypeOf<Incrementer>()

        const i5 = i1.to(Pipe.convert(function (this: { count: number }, i) {
            return i + this.count
        }))
        expectTypeOf(i5).toMatchTypeOf<Incrementer>()

        const i6 = i1.to(Pipe.convert(function (i) {
            return i + this.count
        }))
        expectTypeOf(i6).toMatchTypeOf<Incrementer>()

    })

    it('infer new context through .to() signature', () => {

        const noop = Pipe.from((i: number) => i)
        const i2 = noop.to(i1)
        expectTypeOf(i2).toEqualTypeOf<Incrementer>()

        const i3 = noop.to((i: number, ctx: { count: number }) => i + ctx.count)
        expectTypeOf(i3).toEqualTypeOf<Incrementer>()

        const i4 = noop.to(Pipe.convert(function (this: { count: number }, i: number) {
            return i + this.count
        }))
        expectTypeOf(i4).toEqualTypeOf<Incrementer>()

        const i5 = noop.to(i => i * 2)
        expectTypeOf(i5).toEqualTypeOf<Pipe<number, number>>()

    })

    it('typesafe same through .to() signature', () => {

        const i2 = i1.to((i, ctx) => i + ctx.count)
        expectTypeOf(i2).toEqualTypeOf<Incrementer>()

        const i3 = i1.to(i => i)
        expectTypeOf(i3).toEqualTypeOf<Incrementer>()

        const i4 = i1.to(Pipe.convert(function (this: { count: number }, i: number) {
            return i + this.count
        }))
        expectTypeOf(i4).toEqualTypeOf<Incrementer>()

        const i5 = i1.to<string>(i => `${i}`)
        expectTypeOf(i5).toEqualTypeOf<ContextPipe<number, string, { count: number }>>()
    })

    it('converted methods require a context', () => {

        const hasX = Pipe.convert(function (this: number[], x: number) {
            return this.includes(x) 
                ? true 
                : false
        })
    
        // @ts-expect-error No context
        expect(() => hasX(0)).toThrow('includes')
        expect(hasX(0, [0])).toBe(true)
        expect(hasX.call([0], 0)).toEqual(true)
        expectTypeOf(hasX).toEqualTypeOf<ContextPipe<number, boolean, number[]>>()
    })

})

describe('binding', () => {

    it('.bind() creates a bound pipe from a context pipe', () => {

        const x2 = Pipe.convert(function (this: { by: number }, input: number): number {
            return input * this.by
        })

        const x2b = x2.bind({ by: 10 } as const)
        expect(x2b(20)).toEqual(200)
    })

    it('.bind() creates a bound pipe from a regular pipe', () => {
        const x2 = Pipe.from((i: string) => parseInt(i))
        const x2$ = x2.bind({ by: 10 })

        const x10 = x2$.to((i, ctx) => i * ctx.by)

        expect(x10('10')).toEqual(100)
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

it('appending pipes flattens all of the transforms into a single pipe', () => {
    const m1 = Pipe.from(x2, x2)
    const m2 = Pipe.from(x2, x2)

    const m3 = Pipe.from(m1, m2)
    expect([...m3]).toHaveLength(4)
})