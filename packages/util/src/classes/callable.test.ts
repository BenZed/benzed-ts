import { expectTypeOf } from 'expect-type'
import { toVoid } from '../methods'
import { Falsy, Func } from '../types'
import { Callable } from './callable'

it('is abstract', () => {
    // @ts-expect-error Abstract
    void new Callable((i: number) => i)
})

it('create instances with call signatures', () => {

    class Formatter<S extends string> extends Callable<(i: string) => S> { }

    const format = new Formatter(i => `${i}!` as `${string}!`)
    const hi = format('hi') 
    expect(hi).toEqual('hi!')
})

it('instances have instance properties', () => {
    class Multiply extends Callable<(i: number) => number> {
        constructor(public by: number) {
            super(i => i * this.by) 
        }
    }

    const x2 = new Multiply(2)
    expect(x2.by).toBe(2)
    expect(x2(2)).toEqual(4) 

    x2.by = 5
    expect(x2(5)).toEqual(25)
})

it('keeps getters, setters and instance instance methods', () => {

    class Value<T> extends Callable<() => T> {   

        get value(): T {
            return this._value
        }

        set value(value: T) {
            this._value = value
        }

        getValue(): T {
            return this._value
        }

        setValue(value: T): void {
            this._value = value
        }

        constructor(private _value: T) {
            super(() => this._value)
        }
    } 

    const value = new Value(5)
    expect(value).toHaveProperty('_value', 5)
    expect(value).toHaveProperty('value', 5)
    expect(value).toHaveProperty('getValue')
    expect(value).toHaveProperty('setValue')

    expect(value.value).toEqual(5)
    expect(value.getValue()).toEqual(5)
    expect(value()).toEqual(5)

    value.setValue(10)
    expect(value).toHaveProperty('_value', 10)
    expect(value.value).toEqual(10)
    expect(value.getValue()).toEqual(10)
    expect(value()).toEqual(10)

    value.value = 15
    expect(value).toHaveProperty('_value', 15)
    expect(value.value).toEqual(15)
    expect(value.getValue()).toEqual(15)
    expect(value()).toEqual(15)

    class ArrayValue<T> extends Value<T[]> {
        unwrap(): T {
            return this.value[0]
        }
    }

    const arrayValue = new ArrayValue([5])

    expect(arrayValue.getValue()).toEqual([5])
    expect(arrayValue.unwrap()).toEqual(5)

})

it('gets symbolic properties', () => {  
 
    const $$true = Symbol('unique')
    class Symbolic extends Callable<() => void> { 
 
        [$$true] = true;   

        *[Symbol.iterator](): IterableIterator<symbol> {
            yield $$true
        } 
 
        constructor() {
            super(toVoid)
        }
    } 

    const symbolic = new Symbolic() 
    expect([...symbolic]).toEqual([$$true])

})

it('instanceof', () => {

    class Foo extends Callable<Func> {}
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

    class Spy<A extends unknown[], R> extends Callable<(...args: A) => R> {

        calls = 0

        constructor(f: (...args: A) => R) {
            super((...args) => {
                this.calls++
                return f(...args)
            })
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

    class Converter<T extends number> extends Callable<Convert<T>> {

        constructor(value: T) {
            super(((to?: string) => {
                
                if (to === 'string')
                    return `${value}`

                if (to === 'boolean')
                    return !!value

                return value
            }) as Convert<T>)
        }
    }

    const converter = new Converter(5)

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

        class Foo extends Callable<ReturnsSelfKeyValue> {
            bar = 'bar' as const
            zero = 0 as const
            
            constructor() {
                super(k => this[k])
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

        class Chain extends Callable<ReturnsSelf> { 
            constructor() {
                super(() => this)
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

    it('redirect to other instance methods', () => {

        interface Methods {
            [key: string]: Func
        }

        interface Redirect<M extends Methods, K extends keyof M> {
            (): ReturnType<M[K]>
        }

        class Context<M extends Methods, K extends keyof M> extends Callable<Redirect<M, K>> {

            setKey<Kx extends keyof M>(key: Kx): Context<M,Kx> {
                return new Context(this.methods, key)
            }

            constructor(readonly methods: M, key: K) {
                super(methods[key])
            }
        }

        const zero = new Context({ zero: () => 0 as const, one: () => 1 as const }, 'zero')
        expect(zero()).toEqual(0)

        const one = zero.setKey('one')
        expect(one()).toEqual(1)
    })

    it('can be bound', () => {

        class Shout extends Callable<() => string> {

            constructor(private readonly _words: string) {
                super(function (this: Shout) {
                    return `${this?._words ?? this ?? ''}!`
                })
            }
        }

        const shout = new Shout('hello')

        expect(shout()).toEqual('hello!')
        expect(shout.call('sup')).toEqual('sup!')
        expect(shout.call('')).toEqual('!')
        expect(shout.call(undefined)).toEqual('hello!')

    })

})

describe('Callable.create on generic objects', () => {

    it('adds a function signature to an object', () => {

        const foo = Callable.create(
            function () {
                expectTypeOf(this).toEqualTypeOf<{ foo: string }>()
                return this.foo
            },
            {
                foo: 'bar'
            }
        )

        expect(foo()).toEqual('bar')
        expect(foo.foo).toEqual('bar')

    })

    it('this context is kept in sync', () => {

        const inc = Callable.create(
            function () {
                return ++this.count
            },
            {
                count: 0
            }
        )

        expect(inc()).toBe(1)
        expect(inc()).toBe(2)
        expect(inc.count).toBe(2)
    })

    it('original method is not mutated', () => {

        const zero = (): 0 => 0

        const cZero = Callable.create(zero, { current: 0 })

        expect(zero).not.toHaveProperty('current')
        expect(cZero).toHaveProperty('current', 0)
    })

    it('supports getters/setters', () => {

        const fancy = Callable.create(function () {
            return this.percent
        }, {

            value: 0.25,

            get percent (): `${number}%` {
                return `${this.value * 100}%`
            },

            set percent(value: `${number}%`) {
                this.value = parseFloat(value.replace('%', '')) / 100
            }
        })

        expect(fancy()).toEqual('25%')
        expect(fancy.percent).toEqual('25%')

        fancy.value = 0.4

        expect(fancy()).toEqual('40%')
        expect(fancy.percent).toEqual('40%')

        fancy.percent = '50%'
        expect(fancy.percent).toEqual('50%')
        expect(fancy()).toEqual('50%')
        expect(fancy.value).toEqual(0.5)
    })

    it('creating a callable of a callable', () => {

        const foo = Callable.create(function () {
            return Object.keys(this)
        }, {
            foo: 1
        })

        const bar = Callable.create(function () {
            return this.bar
        }, {
            bar: 2
        })

        const foobar = Callable.create(foo, bar)

        expect(foobar()).toEqual(['foo', 'bar'])
    })

    it('resolves function name & length conflicts', () => {

        const f1 = Callable.create(
            function bar() {
                return 'bar' 
            }, { name: 'ace',length: 5 })

        const f2 = Callable.create(function foo (a) {
            return a 
        }, f1)

        expect(f2).toHaveLength(5)
        expect(f2).toHaveProperty('name', 'ace')

        const f3 = Callable.create(function ace() {
            return 'ace'
        }, {
            length: 10,
            name: 'base'
        })
        expect(f3.length).toEqual(10)
        expect(f3).toHaveProperty('name', 'base')

        const f4 = Callable.create(f3, f2)
        expect(f4.length).toEqual(5)
        expect(f4).toHaveProperty('name', 'ace')

    })

    it('instances keep their prototype methods', () => {

        const foo = Callable.create(
            function foo() {
                return this.foo()
            },
            new class Foo {
                foo(): number {
                    return 0
                }
            }
        )

        const bar = Callable.create(
            function bar() {
                return this.bar()
            },
            new class Bar {
                bar(): number {
                    return 1
                }
            }
        )

        const foobar = Callable.create(bar, foo)
        expect(foobar.foo()).toEqual(0)
    })

})

it('retereive signature', () => {

    class Bar extends Callable<() => void> {}

    const bar = new Bar(toVoid)

    expect(Callable.signatureOf(bar)).toEqual(toVoid)
})

it('retereive template', () => {

    const template = {}

    const noop = Callable.create(toVoid, template)

    expect(Callable.templateOf(noop)).toEqual(template)
    expect(() => Callable.templateOf(parseInt)).toThrow()
})
