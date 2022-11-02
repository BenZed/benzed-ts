import { chain, Chain } from './chain'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const x2 = (i: number): number => i * 2

//// Tests ////

it('create a chain with an initial link', () => {
    
    const parse = chain(parseInt)

    expect(parse('100')).toEqual(100)
    expectTypeOf(parse).toEqualTypeOf<Chain<string, number>>()
})

it('create a chain with multiple links', () => {

    const x32 = chain(x2,x2,x2,x2,x2) 

    expect(x32(1)).toEqual(32)

})

it('multiple links must have the same type', () => {
    // @ts-expect-error mismatching input type
    void chain(x2, parseInt)
})

it('bindable', () => {

    const hasX = chain(function (this: number[], x: number): boolean {
        return this.includes(x) ? true : false
    })

    expect(() => hasX(0)).toThrow('includes')
    expect(hasX.call([0], 0)).toEqual(true)
})

it('creating a chain out of multiple chains flattens the links', () => {
    const m1 = chain(x2, x2)
    const m2 = chain(x2, x2)

    const m3 = chain(m1, m2)
    expect([...m3]).toHaveLength(4)
})

describe('iterable', () => {

    const pow = chain((i: number) => i++).append(i => i * 2)
    
    it('iterates through each link in the chain', () => {
        expect([...pow]).toHaveLength(2)
    })

})

describe('.append()', () => {

    const parse = chain(parseInt)
    const isPositiveDigit = parse.append(i => i > 0)

    it('adds another link method onto a chain', () => {

        expect(isPositiveDigit('10')).toEqual(true)
        expect(isPositiveDigit('-10')).toEqual(false)

        expectTypeOf(isPositiveDigit).toEqualTypeOf<Chain<string, boolean>>()

    })

    it('input type of the appendee link must match chain output', () => {
        // @ts-expect-error incorrect input type
        void parse.append((i: boolean) => !i)
    })

    it('immutable copy', () => {
        expect(parse).not.toBe(isPositiveDigit)
    })

    it('appending chains flattens all of the links into a single chain', () => {
        const m1 = chain(x2, x2)
        const m2 = chain(x2, x2)

        const m3 = chain(m1, m2)
        expect([...m3]).toHaveLength(4)
    })

})

describe('.prepend()', () => {

    it('adds another link to the beginning of a chain', () => {
        
        const p1 = chain(x2).prepend(parseInt)

        expect(p1('1')).toEqual(2)

    })

    it('output type of the prependee link must match chain input', () => {
        // @ts-expect-error incorrect input type
        void chain(parseInt).prepend(x2)
    })

})

