import { Struct, $$state, StructState, StructStateLogic } from './struct-v2'

import { test } from '@jest/globals'
import { assign, pick } from '@benzed/util'

import { expectTypeOf } from 'expect-type'
import copy from './copy'

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