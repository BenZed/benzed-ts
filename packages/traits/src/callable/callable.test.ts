import { Callable } from './callable'
import { Trait } from '../trait'

import { test } from '@jest/globals'
import { Falsy, Func, toVoid } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

//// Callable Signature ////

const Multiplier = Callable<(i: number) => number>

//// Callable Trait ////

class Multiply extends Trait.use(Multiplier) {

    protected get [Multiplier.signature](): (i: number) => number {
        return this.multiply
    }

    multiply(input: number): number {
        return this.by * input
    }

    constructor(public by: number) {
        super()
    }

}

//// Exports ////

it('is abstract', () => {
    // @ts-expect-error Abstract
    expect(() => void new Callable()).toThrow(Error)
})

test('creates instances with call signatures', () => {

    const x2 = new Multiply(2) 

    expect(x2.constructor).toBe(Multiply)
    expect(x2(1)).toBe(2)
    expect(x2 instanceof Multiply).toBe(true)
})

it('keeps getters, setters and instance instance methods', () => {

    abstract class ValueCallable<T> extends Callable<() => T> {
        
        abstract get value(): T 
        abstract set value(value: T)

        getValue(): T {
            return this.value
        }

        setValue(value: T): void {
            this.value = value
        }

        protected get [Callable.signature]() {
            return function () {
                return this.value
            }
        } 
 
    } 

    class Number extends Trait.use(ValueCallable<number>) {
        constructor(public value = 0) {
            super()
        } 
    } 

    const value = new Number(5) 

    expect(value).toHaveProperty('value', 5)
    expect(value).toHaveProperty('getValue')
    expect(value).toHaveProperty('setValue')

    expect(value.value).toEqual(5)
    expect(value.getValue()).toEqual(5)

    expect(value()).toEqual(5)

    value.setValue(10)
    expect(value.value).toEqual(10)
    expect(value.getValue()).toEqual(10)
    expect(value()).toEqual(10)

    value.value = 15
    expect(value.value).toEqual(15)
    expect(value.getValue()).toEqual(15)
    expect(value()).toEqual(15)   

    class ArrayValue extends Trait.use(ValueCallable<number[]>) {

        unwrap(): number {
            return this.value[0]
        }

        constructor(public value: number[]) {
            super()
        }

    }

    const arrayValue = new ArrayValue([5])
    expect(arrayValue.getValue()).toEqual([5])
    expect(arrayValue.unwrap()).toEqual(5)
}) 

it('gets symbolic properties', () => {  
 
    const $$true = Symbol('unique')
    class Symbolic extends Trait.use(Callable<() => void>) { 
 
        protected [$$true] = true

        get [Callable.signature]() {
            return toVoid
        }

        *[Symbol.iterator](): IterableIterator<symbol> {
            yield $$true
        } 

    } 

    const symbolic = new Symbolic() 
    expect([...symbolic]).toEqual([$$true])

})

it('instanceof', () => {

    class Foo extends Trait.use(Callable<Func>) {

        readonly [Callable.signature]: Func 

        constructor(signature: Func) {
            super()
            this[Callable.signature] = signature
        }
    }

    const foo = new Foo(parseInt) 
    expect(foo).toBeInstanceOf(Foo)
    expect(foo).toBeInstanceOf(Function)

    class Bar extends Foo {}
    const bar = new Bar(parseFloat)
    expect(bar).toBeInstanceOf(Bar)
    expect(bar).toBeInstanceOf(Foo)
    expect(bar).toBeInstanceOf(Function)

    expect({} instanceof Bar).toBe(false)
    expect(function() { /**/ } instanceof Bar).toBe(false)
    expect((null as unknown) instanceof Bar).toBe(false)
    expect((NaN as unknown) instanceof Bar).toBe(false)
    expect({} instanceof Bar).toBe(false)

})

test('wrappable method', () => {

    class Spy extends Trait.use(Callable<Func>) {

        calls = 0

        readonly [Callable.signature]: Func

        constructor(signature: Func) {
            super()
            this[Callable.signature] = (...args) => {
                this.calls++
                return signature(...args)
            }
        }
    }

    const parseIntSpy = new Spy(parseInt)
    expect(parseIntSpy('1')).toEqual(1)
    expect(parseIntSpy.calls).toEqual(1)
})

it('multiple signatures', () => {
    interface Convert<T extends number> {
        (): T
        (to: 'string'): `${T}`
        (to: 'boolean'): T extends Falsy ? false : true
    }

    abstract class Converter<T extends number> extends Callable<Convert<T>> {

        get [Callable.signature](): Convert<T> {
            return function (to?: string) {
                
                if (to === 'string')
                    return `${this.value}`

                if (to === 'boolean')
                    return !!this.value

                return this.value
            }
        }

        abstract get value(): T
    }

    class ConvertFive extends Trait.use(Converter<5>) {
        readonly value = 5
    }

    const converter = new ConvertFive()

    expect(converter()).toEqual(5)
    expectTypeOf(converter()).toEqualTypeOf<5>()

    expect(converter('string')).toEqual('5')
    expectTypeOf(converter('string')).toEqualTypeOf<`${5}`>()
    expectTypeOf(converter('string')).toEqualTypeOf<'5'>()

    expect(converter('boolean')).toEqual(true)
    expectTypeOf(converter('boolean')).toEqualTypeOf<true>()
})

describe('this context', () => {

    it('function definition can use this', () => {

        interface ReturnsSelfKeyValue {
            <K extends keyof this>(key: K): this[K]
        }

        class Foo extends Trait.use(Callable<ReturnsSelfKeyValue>) {

            bar = 'bar' as const
            zero = 0 as const

            get [Callable.signature]() {
                return <K extends keyof this>(k: K) => this[k]
            }

        }

        const foo = new Foo() 

        expect(foo('bar')).toEqual('bar')
        expectTypeOf(foo('bar')).toEqualTypeOf<'bar'>()
        expect(foo('zero')).toEqual(0)
        expectTypeOf(foo('zero')).toEqualTypeOf<0>()
    })

    it('can return this', () => { 

        interface ReturnsSelf {
            (): this
        }

        class Chain extends Trait.use(Callable<ReturnsSelf>) { 
            get [Callable.signature]() {
                return function () {
                    return this
                }
            }
        }

        const chain = new Chain()

        expect(chain()).toEqual(chain)
        expect(chain()).toBeInstanceOf(Chain)
        expectTypeOf(chain()).toEqualTypeOf<Chain>()

        class ExtendedChain extends Chain {}

        const eChain = new ExtendedChain()

        expect(eChain()).toEqual(eChain)
        expect(eChain()).toBeInstanceOf(ExtendedChain)
        expectTypeOf(eChain()).toMatchTypeOf<ExtendedChain>()
    })

    it('can be bound', () => {

        class Shout extends Trait.use(Callable<() => string>) {

            get [Callable.signature]() {
                return function (this: Shout) {
                    const ctx = (this[Callable.context] ?? this) as { _words: string }
                    return `${ctx?._words}!`
                }
            }

            constructor(private readonly _words: string) {
                super()
            }
        }

        const shout = new Shout('hello')

        expect(shout()).toEqual('hello!')
        expect(shout.call({ _words: 'sup'})).toEqual('sup!')
        expect(shout.call({ _words: ''})).toEqual('!')
        expect(shout.call(undefined)).toEqual('hello!')

    })

})

it('retreive signature', () => {

    class Voider extends Trait.use(Callable<() => void>) {

        get [Callable.signature]() {
            return toVoid
        }
    }

    const voider = new Voider()
    expect(voider[Callable.signature]).toEqual(toVoid)
})

it('retreive context', () => {

    class Voider extends Trait.use(Callable<() => void>) {

        get [Callable.signature]() {
            return function() {
                return this[Callable.context]
            }
        }
    }

    const voider = new Voider()

    const ace = {
        thing: 'sup',
        voider
    }

    expect(ace.voider()).toBe(ace)
})
