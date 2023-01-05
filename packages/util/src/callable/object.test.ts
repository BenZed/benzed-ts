import { expectTypeOf } from 'expect-type'

import { it, expect, } from '@jest/globals'
import Callable from './callable-v2'

//// Tests ////

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