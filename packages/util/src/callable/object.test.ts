import { createCallableObject } from './object'
import { expectTypeOf } from 'expect-type'

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
        foo: 'bar'
    })

    const bar = createCallableObject(function () {
        return this.bar
    }, {
        bar: 'foo'
    })

    const foobar = createCallableObject(foo, bar)
    expect(foobar()).toEqual(['bar', 'foo'])
})