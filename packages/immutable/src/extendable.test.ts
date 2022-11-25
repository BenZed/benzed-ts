import { extendable, Extendable } from './extendable'
import { copy } from './copy'

import { expectTypeOf } from 'expect-type'
import { $$callable } from './symbols'

//// Tests ////

it('adds an extend method to functions or objects', () => {
    const vector = extendable({ x: 5 }).extend({ y: 5 })
    expect(vector).toEqual({ x: 5, y: 5 })
})

it('is immutable', () => {

    const original = { foo: 'bar' }

    const improved = extendable(original).extend({ cake: 'town' })
    expect(improved).toEqual({ foo: 'bar', cake: 'town' })
    expect(original).not.toBe(improved)

})

it('methods can be extended', () => {

    const run = extendable(
        function getSpeed(this: { speed: number }) {
            return this.speed
        }
    ).extend({
        speed: 5,
    })

    expect(run()).toBe(5)

})

it('extending multiple methods', () => {

    const m1 = extendable(() => 'hi' as const).extend(() => 'bye' as const)

    // second method takes precendence
    expect(m1()).toEqual('bye')

})

it('extending multiple methods and properties', () => {

    const m1 = extendable(
        function (this: { name: string }) {
            return this.name
        }
    ).extend({
        name: 'foo',
        age: 30
    })

    expect(m1()).toEqual('foo')

    const m2 = m1.extend(function ace() {
        return this.age
    })

    expect(m2()).toEqual(30)
})

it('cannot do arrays', () => {

    expect(() => extendable([])).toThrow('Cannot extend Arrays')
})

it('implements immutable copy', () => {

    const m1 = extendable({ thing: 5 })
        .extend(function ace() {
            return this.thing
        })

    const m2 = copy(m1)
    expect(m2).not.toEqual(m1)
})

it('function <this> context kept in sync', () => {

    const mult = extendable({ by: 2 })
        .extend(
            function (input: number) {
                return input * this.by
            }
        )

    expect(mult(2))
        .toEqual(4)

    mult.by = 5 

    expect(mult(10)).toEqual(50)

})

it('preserves getters/setters', () => {

    const ace = extendable({

        progress: 1,

        get percent(): number {
            return this.progress * 100
        },

        set percent(value: number) {
            this.progress = value / 100
        }

    }).extend(
        function getPercentage() {
            return this.percent
        }
    )

    expect(ace.percent).toEqual(100)

    ace.percent = 50
    expect(ace.percent).toEqual(50)
    expect(ace.progress).toEqual(0.5)

    expect(ace()).toEqual(50)
})

it('dangling this bug', () => {

    function shout(this: { scores: number[] }): string {
        return `${this.scores.join('! ')}!`
    }

    const zero = extendable(shout).extend({
        shout,
        scores: [0]
    }).extend({
        increment() {
            return this.extend({ scores: [...this.scores, this.scores.length] })
        },
    })

    expect(zero()).toEqual('0!')
    expect(zero.shout()).toEqual('0!')

    const one = zero.increment()

    expect(one()).toEqual('0! 1!')
    expect(one.shout()).toEqual('0! 1!')

    const two = (extendable(one) as any).increment()
    expect(two.shout()).toEqual('0! 1! 2!')
    expect(two()).toEqual('0! 1! 2!')

})

it('handles conflicting extensions', () => {

    void extendable

    const flag1 = extendable({
        required: true as const
    })
    expectTypeOf(flag1).toEqualTypeOf<Extendable<{ required: true }>>()

    const flag2 = flag1.extend({ required: false as const })
    expectTypeOf(flag2).toEqualTypeOf<Extendable<{ required: false }>>()

})

it('handles conflicting "extend" definitions', () => {

    const smartass1 = extendable({
        foo: 'bar',
        extend(input: object) {
            return !!input
        }
    })

    void extendable

    // does not keep extend(object):true signature
    const smartass2 = smartass1.extend({})

    expectTypeOf(smartass2)
        .not
        .toMatchTypeOf<true>()

    expectTypeOf(smartass1)
        .not
        .toMatchTypeOf<Extendable<{ foo: string, extend(input: object): true }>>()

    const smartass3 = smartass1.extend({ bar: 'foo', extend: false })
    expectTypeOf(smartass3)
        .not
        .toMatchTypeOf<true>()

})

it('no $$callable property on non-callable extensions', () => {

    const ace = extendable({ ace: 10 })

    expect($$callable in ace).toBe(false)
})

it('combining extendables', () => {

    const foo = extendable({ foo: 'foo' })
        .extend(function foo(){
            return this.foo
        })

    const bar = extendable({ bar: 'bar' })
        .extend(function bar(){
            return this.bar
        })

    const foobar = foo
        .extend(bar)
        .extend({ bar: 'ace' })

    expect(foobar()).toEqual('ace')
})

it('extended object get inferred this context', () => {

    const acer = extendable({ ace: 1 })
        .extend({
            getAce() {
                expectTypeOf(this).toEqualTypeOf<Extendable<{ ace: number }>>()
                return this.ace
            }
        })

    const ace = acer.getAce()
    expectTypeOf(ace).toMatchTypeOf<number>()

    const acer2 = acer.extend(
        function x2() {
            expectTypeOf(this).toMatchTypeOf<Extendable<{ 
                ace: number 
                getAce(): number
            }>>()

            return this.ace * 2
        }
    )

    expect(acer2()).toEqual(2)
})