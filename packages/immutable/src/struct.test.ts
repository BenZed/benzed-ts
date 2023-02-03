import { Struct, $$state, StructState, StructStateLogic } from './struct'

import { test } from '@jest/globals'
import { assign, Func, pick, Property } from '@benzed/util'

import { expectTypeOf } from 'expect-type'
import { unique } from '@benzed/array'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Tests ////

test('spread state matches struct state', () => {

    class Person extends Struct implements StructStateLogic<{ age: number }> {

        constructor(readonly name: string, readonly age: number) { 
            super()
        }

        speak(): string {
            return `My name is ${this.name}, I am ${this.age} years old.`
        }

        get [$$state](): { age: number } {
            return pick(this, 'age')
        }
    }

    const jerry = new Person('jerry', 35)  
    expect({ ...jerry }).toEqual({ age: 35 })

    expect(jerry[$$state]).toEqual({ age: 35 }) 
})

test('overridden state setter', () => {
    
    const $$cost = Symbol('animal cost')
    let customStateReads = 0
    let customStateSets = 0 
    class Jewelry extends Struct implements StructStateLogic<{ [$$cost]: number }> {

        protected [$$cost]: number

        constructor(cost: number) {
            super()

            this[$$cost] = cost
        }

        get [$$state](): { [$$cost]: number } {
            customStateReads++
            return {
                [$$cost]: this[$$cost]
            }
        }

        set [$$state](state: { [$$cost]: number }) {
            customStateSets++
            this[$$cost] = state[$$cost]
        }  

    } 

    const cheap = new Jewelry(10) 
    expect({ ...cheap }).toEqual({ [$$cost]: 10 })

    const expensive = Jewelry.applyState(cheap, { [$$cost]: 50 })
    expect({ ...expensive }).toEqual({ [$$cost]: 50 })

    expect(customStateReads).toEqual(2)
    expect(customStateSets).toEqual(1)

})

test('state logic is overridable', () => {

    class Ticker extends Struct {
        constructor(public seconds: number) {
            super()
        }
    }

    const t1 = new Ticker(60)
    const t1State = { ...t1 }
    expect(t1State).toEqual({ seconds: 60 })
    expectTypeOf<typeof t1State>().toEqualTypeOf<{ seconds: number }>()
    expectTypeOf<StructState<typeof t1>>().toEqualTypeOf<{ seconds: number }>()

    class Timer extends Ticker implements StructStateLogic<{ seconds: number }> {

        get minutes(): number {
            return Math.floor(this.seconds / 60)
        }

        get [$$state](): { seconds: number } {
            return pick(this, 'seconds')
        }

        set [$$state](state) {
            assign(this, pick(state, 'seconds'))
        }

    }

    const t2 = new Timer(120)
    const t2State = { ...t2 }
    expect(t2State).toEqual({ seconds: 120 })
    expectTypeOf<typeof t2State>().toEqualTypeOf<{ seconds: number }>()
    expectTypeOf<StructState<typeof t2>>().toEqualTypeOf<{ seconds: number }>()

    class Clock extends Timer implements StructStateLogic<{ seconds: number, dark: boolean }> {

        get hours(): number {
            return Math.floor(this.minutes / 60)
        }

        get [$$state](): { seconds: number, dark: boolean } {

            const { seconds } = this
            const dark = this.hours > 12 
 
            return {
                seconds,
                dark
            }
        } 

        set [$$state](state: { seconds: number, dark: boolean }) {
            assign(this, pick(state, 'seconds'))
        }
    }

    const t3 = new Clock(120)
    const t3State = { ...t2 }
    expect(t3State).toEqual({ seconds: 120 })
    expectTypeOf<typeof t3State>().toEqualTypeOf<{ seconds: number }>()
    expectTypeOf<StructState<typeof t3>>().toEqualTypeOf<{ seconds: number, dark: boolean }>()

})

test('callable', () => {

    class Multiplier extends Struct<(i: number) => number> {
        constructor(readonly by: number) {
            super(function mulitply(this: Multiplier, i: number) {
                return i * this.by
            })
        }
    }

    const x2 = new Multiplier(2)
    expect(x2(2)).toEqual(4)

    const x4 = Struct.applyState(x2, { by: 4 })
    expect(x4(4)).toEqual(16)

})

test('callable wth proxies', () => {

    const callable = <O extends object, F extends Func>(
        object: O,
        func: F
    ): F & O => {
        return new Proxy(func, {
            apply(func, _, args) {
                return Reflect.apply(func, object, args)
            },
            ownKeys(_) {
                return [
                    ...Reflect.ownKeys(object),
                    'prototype'
                ].filter(unique)
            },
            get(_, key, proxy) {
                return Reflect.get(object, key, proxy)
            },
            set(_, key, proxy) {
                return Reflect.set(object, key, proxy)
            }
        }) as F & O
    }

    class By {
        constructor(public by: number) {}
    }

    const by5 = new By(5)

    const multiplier = callable(
        by5, 
        function multiply(input: number) {
            return input * this.by
        }
    )

    multiplier.by = 10

})