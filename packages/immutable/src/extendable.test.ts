
import { nil } from '@benzed/util'

import { extendable, Extendable, Extended } from './extendable'
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

    expectTypeOf(improved).toMatchTypeOf<Extended<{ foo: string }, { cake: string }>>()

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

it('extends arrays', () => {

    const arr = extendable(
        function even(this: number[]): number[] {
            return this.filter(i => i % 2 === 0)
        })
        .extend([ 1, 2, 3 ])
        .extend({ ace: 5 })

    expect(arr()).toEqual([2])
    expect(arr.ace).toEqual(5)
})

it('array types resolve nicely', () => {

    expectTypeOf(
        extendable([1,2,3]).extend({ ace: 10 })
    ).toMatchTypeOf<Extended<number[], { ace: number }>>()
    expectTypeOf(
        extendable([1,2,3] as readonly number[]).extend({ ace: 10 })
    ).toMatchTypeOf<Extended<readonly number[], { ace: number }>>()
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
            return (this as Extendable<typeof this>)
                .extend({ scores: [...this.scores, this.scores.length] })
        },
    })

    expect(zero()).toEqual('0!')
    expect(zero.shout()).toEqual('0!')

    const one = zero.increment()

    expect(one()).toEqual('0! 1!')
    expect(one.shout()).toEqual('0! 1!')

    const two = (extendable(one) as unknown as typeof zero).increment()
    expect(two.shout()).toEqual('0! 1! 2!')
    expect(two()).toEqual('0! 1! 2!')

})

it('handles conflicting extensions', () => {

    void extendable

    const flag1 = extendable({
        required: true as const
    })
    expectTypeOf(flag1).toMatchTypeOf<Extendable<{ required: true }>>()

    const flag2 = flag1.extend({ required: false as const })
    expectTypeOf(flag2).toMatchTypeOf<Extendable<{ required: false }>>()

})

it('handles conflicting "extend" definitions', () => {

    const smartass1 = extendable({
        foo: 'bar',
        extend(input: object) {
            return !!input
        }
    })

    // does not keep extend(object):true signature
    const smartass2 = smartass1.extend({ face: 'string' })

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

    const foobar = foo.extend(bar)

    expect(foobar()).toEqual('bar')
})

it('extended object get inferred this context', () => {

    const acer = extendable({ ace: 1 })
        .extend({
            getAce() {
                expectTypeOf(this).toMatchTypeOf<{ ace: number }>()
                return this.ace
            }
        })

    const ace = acer.getAce()
    expectTypeOf(ace).toMatchTypeOf<number>()

    const acer2 = acer.extend(
        function x2() {

            expectTypeOf(this).toMatchTypeOf<{ 
                ace: number 
                getAce(): number
            }>()

            return this.ace * 2
        }
    )

    expect(acer2()).toEqual(2)
})

it('extensions which make no changes are ignored', () => {

    const base = extendable({ base: 'sup' })
        .extend({})
    
    expectTypeOf(base).toMatchTypeOf<Extendable<{ base: string }>>()
 
    const ace = extendable({ ace: true })
        .extend({ ace: true })

    expectTypeOf(ace).toMatchTypeOf<Extendable<{ ace: true }>>()

    const run = extendable(() => 'run').extend(() => 'run')
    expectTypeOf(run).toMatchTypeOf<Extendable<() => string>>()

})

it('handles overwrites', () => {

    const boom = extendable((input: number) => input * 2)
        .extend((input: string) => `${input}`)

    expectTypeOf(boom).toMatchTypeOf<Extendable<(input: string) => string>>()
})

it('handles deletions', () => {

    const ace = extendable({ ace: true })
        .extend({ base: true })
        .extend({ base: undefined })

    expect(ace).toHaveProperty('base', undefined)
    expectTypeOf(ace).toMatchTypeOf<Extendable<{ ace: true }>>()

    const base = extendable({ base: 2, main: 'man' })
        .extend({ main: undefined })

    expectTypeOf(base).toMatchTypeOf<Extendable<{ base: number }>>()

    const empty = extendable({ fight: 'flight' }).extend({ fight: undefined })
    // eslint-disable-next-line @typescript-eslint/ban-types
    expectTypeOf(empty).toMatchTypeOf<Extendable<{}>>()

    const regression1 = extendable({ ace: 1, base: 2 })
        .extend({ case: 3 })

    const regression2 = regression1
        .extend({ ace: undefined })
    
    expectTypeOf(regression2).toMatchTypeOf<Extendable<{ base: number, case: number }>>()

})

it('extending extendable types', () => {

    const e = extendable({ ace: true })
    const f = extendable(function hey() {
        return 'hey' 
    })

    const ef = e.extend(f)
    expectTypeOf(ef).toMatchTypeOf<Extended<{ ace: boolean }, () => string>>()

    const b1 = extendable({ bone: true })
    const b2 = extendable(b1)

    expectTypeOf(b2).toMatchTypeOf(b1)

    const c1 = extendable(function ace() {
        return 1 
    })

    const c2 = extendable(c1)
    expectTypeOf(c2).toMatchTypeOf(c1)
})

it('explicitly typed extendable', () => {

    interface Module<T> {
        data: T
        parent: Module<unknown> | nil
    }

    const m1 = extendable<Module<string>>({
        data: 'ace',
        parent: nil
    })
    expectTypeOf(m1).toMatchTypeOf<Extendable<Module<string>>>()

    const m2 = m1.extend({ modules: [] as number[] })
    expectTypeOf(m2).toMatchTypeOf<Extended<Module<string>, { modules: number[] }>>()

    const m3 = m2.extend({ data: 'bar' } as { data: string })
    expectTypeOf(m3).toMatchTypeOf<Extended<Module<string>, { modules: number[] }>>()

    const m4 = m3.extend({ modules: undefined })
    expectTypeOf(m4).toMatchTypeOf<Extendable<Module<string>>>()

    const m5 = m4.extend({ parent: 100 })
    expectTypeOf(m5).toMatchTypeOf<Extendable<{ parent: number, data: string }>>()

})

it('extending extended', () => {

    const e1 = extendable(() => 100).extend({ hey: 'neigh' })
    const e2 = extendable({ face: 'case' }).extend(() => 'string')

    const e3 = e1.extend(e2)
    expectTypeOf(e3).toMatchTypeOf<Extendable<{ hey: string, face: string } & (() => string)>>()

})