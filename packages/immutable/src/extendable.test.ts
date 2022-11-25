import { extendable } from './extendable'
import { copy } from './copy'

it('adds an extend method to functions or objects', () => {
    const vector = extendable({ x: 5 }).extend({ y: 5 })
    expect(vector).toEqual({ x: 5, y: 5 })
})

it('is immutable', () => {

    const original = { foo: 'bar' }

    const improved = extendable(original).extend({ cake: 'town' })
    expect(improved)
        .toEqual({ foo: 'bar', cake: 'town' })

    expect(improved)
        .not
        .toBe(original)

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

    const m1 = extendable(() => 'hi').extend(() => 'bye')

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

it('function this context kept in sync', () => {

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

it('getters/setters', () => {

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