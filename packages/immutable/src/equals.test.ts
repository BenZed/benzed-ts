import equals from './equals'
import { inspect } from 'util'
import { $$equals } from './symbols'

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('equals()', () => {

    describe('returns true if two operands are "value-equal"', () => {

        describe('works on primitives', () => {

            const SYMBOL = Symbol('c')

            const primitives = [
                [-1, -1, true],
                [-1, 1, false],
                [Infinity, -Infinity, false],
                [-Infinity, -Infinity, true],
                [Infinity, Infinity, true],
                [true, true, true],
                [true, false, false],
                [false, false, true],
                ['true', true, false],
                [null, null, true],
                [null, undefined, false],
                [undefined, undefined, true],
                [NaN, NaN, true],
                [Symbol('a'), Symbol('b'), false],
                [Symbol('c'), Symbol('c'), false],
                [SYMBOL, SYMBOL, true],
                ['string', 'string', true],
                ['string', 'long-string', false]
            ]

            for (const [a, b, output] of primitives) {
                it(inspect(
                    `${a?.toString()} equals ` +
                    `${b?.toString()} : ${output?.toString()}`
                ), () => {
                    expect(equals(a, b)).toEqual(output)
                })
            }
        })
    })

    describe('works on arrays', () => {
        it('[1,2,3] equals [1,2,3]', () =>
            expect(equals([1, 2, 3], [1, 2, 3])).toEqual(true)
        )

        it('[1,2] not equal [1,2,3]', () =>
            expect(equals([1, 2], [1, 2, 3])).toEqual(false)
        )
        describe('typed arrays', () => {
            const typedArrays = [
                Int8Array,
                Uint8Array,
                Uint8ClampedArray,
                Int16Array,
                Uint16Array,
                Int32Array,
                Uint32Array,
                Float32Array,
                Float64Array
            ]

            for (const TypedArray of typedArrays) {
                it(`${TypedArray.name} [ 1, 2, 4 ] equals [ 1, 2, 4 ]`, () => {
                    const opt1 = new TypedArray([1, 2, 4])
                    const opt2 = new TypedArray([1, 2, 4])
                    expect(equals(opt1, opt2)).toEqual(true)
                })

                it(`${TypedArray.name} [ 1, 2, 4 ] not equal [ 1, 2 ]`, () => {
                    const opt1 = new TypedArray([1, 2, 4])
                    const opt2 = new TypedArray([1, 2])
                    expect(equals(opt1, opt2)).toEqual(false)
                })

            }
        })
    })

    describe('works on objects', () => {

        it('plain', () => {

            const obj1 = { foo: 'bar' }
            const obj2 = { foo: 'bar' }
            const obj3 = { foo: 'baz' }

            expect(equals(obj1, obj1)).toEqual(true)
            expect(equals(obj1, obj2)).toEqual(true)
            expect(equals(obj1, obj3)).toEqual(false)

        })

        it('plain with mismatch keys', () => {

            const ob1 = {
                foo: 'bar'
            }

            const ob2 = {
                foo: 'bar',
                cake: 'town'
            }

            expect(equals(ob1, ob2)).toEqual(false)
        })

        it('works on dates', () => {
            const a = new Date()
            const b = new Date()

            expect(equals(a, b)).toEqual(true)

            const c = new Date(1000)

            expect(equals(a, c)).toEqual(false)
        })

        it('works on functions', () => {

            const foo: any = (): string => 'foo'
            const foo2: any = (): string => 'foo'
            const bar: any = (): string => 'bar'
            const bar2: any = (): string => 'bar'

            foo[$$equals] =
                foo2[$$equals] =
                bar[$$equals] =
                bar2[$$equals] =
                function (other: any) {
                    return other() === this()
                }

            expect(equals(foo, bar)).toEqual(false)
            expect(equals(foo, foo2)).toEqual(true)
            expect(equals(bar, bar2)).toEqual(true)

        })

        it('works on class instance functions', () => {

            class Foo {
                public funcProp = (): void => { /**/ }
                public funcLoose(): void { /**/ }
                public funcBound(): void { /**/ }

                public constructor () {
                    this.funcBound = this.funcBound.bind(this)
                }
            }

            const foo1 = new Foo()
            const foo2 = new Foo()

            expect(foo1.funcProp).not.toBe(foo2.funcProp)
            expect(foo1.funcLoose).toBe(foo2.funcLoose)
            expect(foo1.funcBound).not.toBe(foo2.funcBound)

            expect(equals(foo1.funcProp, foo2.funcProp)).toEqual(false)
            expect(equals(foo1.funcLoose, foo2.funcLoose)).toEqual(true)
            expect(equals(foo1.funcBound, foo2.funcBound)).toEqual(false)
        })

        it('works on keyed functions with matching keyed objects', () => {

            const foo = (): void => { /* */ }
            const bar = {
                length: foo.length,
                name: foo.name
            }

            expect(equals(foo, bar)).toEqual(false)
        })

        it('implementing symbolic $$equals', () => {

            let calls = 0

            class Foo {

                public bar: string

                public constructor (bar: any) {
                    this.bar = bar
                }

                public [$$equals](b: any): boolean {
                    calls++
                    return b instanceof Foo && b.bar === this.bar
                }
            }

            const foo1 = new Foo('bar')
            const foo2 = new Foo('bar')
            const foo3 = new Foo('baz')

            expect(equals(foo1, foo2)).toEqual(true)
            expect(equals(foo1, foo3)).toEqual(false)

            // calls should not increment, because objects are reference identical
            expect(equals(foo1, foo1)).toEqual(true)

            expect(calls).toEqual(2)

        })

        it('handles circular references', () => {

            const circle: any = {
                foo: 'bar'
            }

            circle.circle = circle

            expect(() => equals(circle, circle)).not.toThrow(Error)
            expect(equals(circle, { foo: 'bar', circle })).toEqual(true)

        })
    })

    it('checks for identicality first', () => {

        let count = 0

        class EqualSpy {
            public [$$equals](b: unknown): boolean {
                count++
                return this === b
            }
        }

        const e = new EqualSpy()

        expect(equals(e, e)).toEqual(true)
        expect(count).toEqual(0)

    })

    it('works on native Map objects', () => {
        const mapa = new Map()
        const mapb = new Map()

        expect(equals(mapa, mapb)).toEqual(true)

        mapa.set(0, 'zero')
        expect(equals(mapa, mapb)).toEqual(false)

    })

    it('works on native Set objects', () => {
        const seta = new Set()
        const setb = new Set()

        expect(equals(seta, setb)).toEqual(true)

        setb.add(0)
        expect(equals(seta, setb)).toEqual(false)

    })

    it('works on regex', () => {
        const onlya = /a/g
        const onlyb = /b/i

        expect(equals(onlya, onlyb)).toEqual(false)
        expect(equals(onlya, /a/g)).toEqual(true)
        expect(equals(onlya, /a/)).toEqual(false)
    })

    describe('allows primitives to be compared in overridden equality methods', () => {

        describe('works on $$equals method', () => {

            class Account {

                public amount: number

                public constructor (amount: any) {
                    if (amount instanceof Account)
                        amount = amount.amount
                    this.amount = amount
                }

                public toString(): string {
                    return `$${this.amount}`
                }

                public [$$equals](right: unknown): boolean {
                    const left = this.amount
                    right = right instanceof Account
                        ? right.amount
                        : (right as number)

                    return left === right || Number.isNaN(left) && Number.isNaN(right)
                }
            }

            const blingin = new Account(10000)
            const poor = new Account(-5)
            const invalid = new Account(NaN)

            const amounts = [
                invalid, blingin, poor, blingin.amount, poor.amount, null,
                invalid.amount, 0, Infinity
            ]

            for (const a of amounts) {
                for (const b of amounts) {
                    const result =
                        Number.isNaN(a) && Number.isNaN(b) ||
                        a === null && b === null ||
                        a !== null && b !== null &&
                        new Account(a)[$$equals](new Account(b))

                    it(inspect(`equals(${a}, ${b}) === ${result}`), () => {
                        expect(equals(a, b)).toEqual(result)
                    })
                }
            }
        })
    })
})