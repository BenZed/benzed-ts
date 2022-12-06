import { createCallableObject } from './object'
import { expectTypeOf } from 'expect-type'
import property from '../property'

////  ////

it('adds a function signature to an object', () => {

    const foo = createCallableObject(
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

    const inc = createCallableObject(
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

    const cZero = createCallableObject(zero, { current: 0 })

    expect(zero).not.toHaveProperty('current')
    expect(cZero).toHaveProperty('current', 0)
})

it('supports getters/setters', () => {

    const fancy = createCallableObject(function () {
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

    const foo = createCallableObject(function () {
        return Object.keys(this)
    }, {
        foo: 1
    })

    const bar = createCallableObject(function () {
        return this.bar
    }, {
        bar: 2
    })

    const foobar = createCallableObject(foo, bar)

    expect(foobar()).toEqual(['foo', 'bar'])
})

it('resolves function name & length conflicts', () => {

    const f1 = createCallableObject(
        function bar() {
            return 'bar' 
        }, { name: 'ace',length: 5 })

    const f2 = createCallableObject(function foo (a) {
        return a 
    }, f1)

    expect(f2).toHaveLength(5)
    expect(f2).toHaveProperty('name', 'ace')

    const f3 = createCallableObject(function ace() {
        return 'ace'
    }, {
        length: 10,
        name: 'base'
    })
    expect(f3.length).toEqual(10)
    expect(f3).toHaveProperty('name', 'base')

    const f4 = createCallableObject(f3, f2)
    expect(f4.length).toEqual(5)
    expect(f4).toHaveProperty('name', 'ace')

})

it('instances keep their prototype methods', () => {

    const foo = createCallableObject(
        function foo() {
            return this.foo()
        },
        new class Foo {
            foo(): number {
                return 0
            }
        }
    )

    const bar = createCallableObject(
        function bar() {
            return this.bar()
        },
        new class Bar {
            bar(): number {
                return 1
            }
        }
    )

    const foobar = createCallableObject(bar, foo)

    // expect(foobar.bar()).toEqual(1)
    expect(foobar.foo()).toEqual(0)
})