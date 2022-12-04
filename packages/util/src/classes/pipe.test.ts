import { pipe, Pipe } from './pipe'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const x2 = (i: number): number => i * 2

//// Tests ////

it('create a pipe with an initial transform', () => {
    
    const parse = pipe(parseInt)

    expect(parse('100')).toEqual(100)
    expectTypeOf(parse).toEqualTypeOf<Pipe<string, number>>()
})

it('create a pipe with multiple transforms', () => {

    const x32 = pipe(x2,x2,x2,x2,x2) 

    expect(x32(1)).toEqual(32)

})

it('multiple transforms must have the same type', () => {
    // @ts-expect-error mismatching input type
    void pipe(x2, parseInt)
})

it('bindable', () => {

    const hasX = pipe(function (this: number[], x: number): boolean {
        return this.includes(x) ? true : false
    })

    expect(() => hasX(0)).toThrow('includes')
    expect(hasX.call([0], 0)).toEqual(true)
})

it('creating a pipe out of multiple pipes flattens the transforms', () => {
    const m1 = pipe(x2, x2)
    const m2 = pipe(x2, x2)

    const m3 = pipe(m1, m2)
    expect([...m3]).toHaveLength(4)
})

describe('iterable', () => {

    const pow = pipe((i: number) => i++).to(i => i * 2)
    
    it('iterates through each transform in the pipe', () => {
        expect([...pow]).toHaveLength(2)
    })

})

describe('.to()', () => {

    const parse = pipe(parseInt)
    const isPositiveDigit = parse.to(i => i > 0)

    it('adds another transform method onto a pipe', () => {

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

    it('appending pipes flattens all of the transforms into a single pipe', () => {
        const m1 = pipe(x2, x2)
        const m2 = pipe(x2, x2)

        const m3 = pipe(m1, m2)
        expect([...m3]).toHaveLength(4)
    })

})

