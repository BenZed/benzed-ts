import { 

    PublicStruct,
    Struct,

    copy, 
    copyWithoutState,

    equals,

} from './struct'

import {

    $$state,
    applyState,
    getDeepState as getState,
    setState,
    
    showStateKeys,
    hideNonStateKeys,
    State,

} from './state'

import {

    assign,
    Empty,
    isNumber, 
    isString, 
    keysOf,

} from '@benzed/util'

import { it, expect, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'

//// Tests ////

describe('basic object struct, no state', () => {

    abstract class Value<T> extends Struct {

        abstract get value(): T
    }

    const f1 = new class Number extends Value<number> {
        value = 5
    }

    const f2 = copy(f1)

    it('copyable', () => {
        expect(f2).toEqual(f1)
        expect(f2).not.toBe(f1)
    })

    it('equalable', () => {
        expect(equals(f1,f2)).toBe(true)

        const s1 = copy(f1)
        expect(equals(s1,f1)).toBe(true)

        s1.value = 6

        expect(equals(s1,f1)).not.toBe(true)
    })

})

describe('basic object struct with state', () => {

    class Average extends Struct {

        readonly scores: number[]

        get average(): number {
            return this.scores.reduce((sum, val) => val + sum) / this.scores.length
        }

        constructor(...scores: number[]) {
            super()
            this.scores = scores
        }

        get [$$state](): { scores: number[] } {
            return { ...this }
        }
    }

    const a1 = new Average(5, 10, 15)
    const a2 = copy(a1)

    it('get state', () => {
        expect(getState(a1)).toEqual({ scores: [ 5, 10, 15 ] })
        expect(getState(a1)).toEqual({ ...a1 })
        expect(a1.average).toEqual(10)
    })

    it('set state', () => {
        const a3 = new Average(2)

        setState(a3, { scores: [7,7,7] })

        expect(a3.average).toEqual(7)
        expect(getState(a3)).toEqual({ scores: [7,7,7] })
        expect(getState(a3)).toEqual({ ...a3 })
    })

    it('apply state', () => {
        const a3 = applyState(a2, { scores: [4,4,4] })
        expect(getState(a3)).toEqual({ scores: [ 4,4,4 ]})
        expect(getState(a3)).toEqual({ ...a3 })
        expect(a3).not.toBe(a2)
    })

    it('copyable', () => {
        expect(a2).toEqual(a1)
        expect(a2).not.toBe(a1)
    })

    it('equalable', () => {
        const a3 = copy(a1)
        expect(equals(a3, a2)).toBe(true)

        // @ts-expect-error Readonly
        a3.scores = [0]
        expect(equals(a3, a2)).not.toBe(true)
    })

})

describe('callable struct no state', () => {

    class Multiply extends Struct<(input: number) => number> {
        constructor(public by: number) {
            super(function(i) {
                return i * this.by
            })
        }
    }
    const x2a = new Multiply(2)
    const x2b = copy(x2a)

    it('callable', () => {
        const x2 = new Multiply(2)
        expect(x2(5)).toEqual(10)
    })

    it('equalable', () => {
        const x2c = copy(x2b)
        expect(equals(x2c, x2a)).toBe(true)

        x2c.by = 5
        expect(equals(x2c, x2a)).not.toBe(true)
    })

    it('copyable', () => {
        expect(equals(x2b, x2a)).toBe(true)
        expect(x2b).not.toBe(x2a)
    })

})

describe('callable struct with state', () => {

    class Task extends Struct<() => boolean> {

        constructor(
            readonly complete: boolean,
            readonly description: string,
            public observerIds: number[]
        ) {
            super(function () {
                return this.complete
            })

            hideNonStateKeys(this, 'observerIds')
        }
        
        get [$$state](): { complete: boolean, description: string } {
            return { ...this }
        }

    }

    const t1 = new Task(false, 'Complete Struct class', [])

    const t2 = copy(t1)

    it('callable', () => {
        expect(t1()).toBe(false)
        expect(t2()).toBe(false)
    })

    it('get state', () => {
        expect(getState(t1)) 
            .toEqual({ complete: false, description: 'Complete Struct class'})
    })
    
    it('set state', () => {

        const t3 = new Task(false, 'Salt the plants', [1,2,3])

        setState(t3, { complete: true, description: 'water the plants' })
        expect(getState(t3)).toEqual({ complete: true, description: 'water the plants' })
        expect(getState(t3)).toEqual({ ...t3 })
    })

    it('apply state', () => {  

        const t4 = applyState(t2, { complete: true })

        expect(t4()).toEqual(true)
        expect(getState(t4)).toEqual({ complete: true, description: t2.description })
        expect(getState(t4)).toEqual({ ...t4 })
 
    })

    it('equalable', () => {
        expect(equals(t2, t1)).toBe(true)
    })

    it('copyable', () => {
        expect(t1).not.toBe(t2)
    })

})

describe('stateful convention', () => {

    function damage(this: Damage): number {
        return this.damage()
    }

    // type DamageSettings<T extends Damage> = StructState<T>

    type DamageSettingsApply<T extends Damage> = State<T>

    abstract class Damage extends Struct<() => number> {

        static applySettings<T extends Damage>(damage: T, settings: DamageSettingsApply<T>): T {
            return applyState(damage, settings)
        }

        constructor() {
            super(damage)
        }

        abstract toString(): string

        abstract damage(): number

    }

    abstract class RandomDamage extends Damage {

        abstract get min(): number 

        abstract get max(): number

        damage(): number {
            return Math.floor(this.min + Math.random() * this.max)
        }

    }

    abstract class StatefulRandomDamage extends RandomDamage {

        get [$$state](): { min: number, max: number } {
            return { ...this }
        }
    }

    class CustomRandomDamage extends StatefulRandomDamage {

        constructor(
            readonly min: number, 
            readonly max: number, 
            description?: string | ((dmg: CustomRandomDamage) => string),
        ) {
            super()

            if (description) {
                this.description = isString(description)
                    ? () => description
                    : description
            }

            showStateKeys(this, 'description')
        }

        description(dmg: this): string {
            return `You have received ${dmg.damage()}`
        }

        toString(): string {
            return this.description(this)
        }

        get [$$state](): {
            min: number
            max: number
            description: CustomRandomDamage['description']
        } {
            return { ...this }
        }
    }

    const fireDamage = new class FireDamage extends StatefulRandomDamage {

        readonly min = 15

        readonly max = 30

        toString(): string {
            return `You are burned for ${this.damage()} damage!`
        }

    }

    const skyDamage = new CustomRandomDamage(
        5, 
        100, 
        dmg => `You are damaged ${dmg.damage()} by the sky!`,
    )

    const mysteryDamage = new class MysteryDamage extends Damage {

        damage(): number {
            return 1000
        }
        
        toString(): string {
            return `A mysterioud force causes ${this.damage()} damage!` 
        }

    }

    test('getState()', () => {
        expect({ ...fireDamage }).toEqual({ min: 15, max: 30 })
        expect(getState(fireDamage)).toEqual({ ...fireDamage })

        expect({ ...skyDamage }).toEqual({ min: 5, max: 100, description: expect.any(Function) })
        expect(getState(skyDamage)).toEqual({ ...skyDamage })

        expect({ ...mysteryDamage }).toEqual({})
        expect(getState(mysteryDamage)).toEqual({})
    })

    test('setState()', () => {

        const fireDamage2 = copyWithoutState(fireDamage)
        setState(fireDamage2, { min: 25, max: 40 })
        expect(getState(fireDamage2)).toEqual({ min: 25, max: 40 })

        const skyDamage2 = copyWithoutState(skyDamage)
        setState(skyDamage2, {
            min: 5,
            max: 100,
            description() {
                return 'Look up!'
            }
        })

        expect(getState(skyDamage2)).toEqual({ 
            min: 5, 
            max: 100 
            // no description because state key visibility was not matched
        })

        expect(skyDamage2.description(skyDamage2)).toEqual('Look up!')

    })

    test('copyWithoutState', () => {
        const blankSkyDamage = copyWithoutState(skyDamage)

        expect(getState(blankSkyDamage)).toEqual({})
        expect(blankSkyDamage).toBeInstanceOf(skyDamage.constructor)
        expect(blankSkyDamage.description(blankSkyDamage)).toEqual('You have received NaN')
    })

    test('applyState()', () => {
        const skyDamage2 = applyState(skyDamage, { min: 10 })
        expect(getState(skyDamage2)).toEqual({ ...skyDamage, min: 10 })
    })

})

describe('set/get nested state', () => {

    abstract class NumericValue extends Struct<() => number> {

        get name(): string {
            return this.constructor.name
        }

        constructor() {
            super(function() {
                return this.valueOf()
            })
        }

        abstract valueOf(): number 
    
    }

    abstract class PropertySum extends NumericValue {
        valueOf(): number {
            let sum = 0
            for (const key of keysOf(this)) {

                const value = isNumber(this[key]) 
                    ? this[key] as number
                    : this[key]?.valueOf() ?? 0

                if (isNumber(value))
                    sum += value
            }
            return sum
        }
    }

    abstract class LiteralValue extends NumericValue {

        abstract get value(): number | { valueOf(): number }

        valueOf(): number {
            return isNumber(this.value) 
                ? this.value 
                : this.value.valueOf()
        }

    }

    abstract class Multiplier extends LiteralValue {

        abstract get by(): number

        valueOf(): number {
            return super.valueOf() * this.by
        }
    }

    abstract class StatefulMultiplier extends Multiplier {

        constructor() {
            super()
            showStateKeys(this, 'by')
        }

        set [$$state](state: { by: number }) {
            assign(this, state)
        }
    }

    const cards = new class CardValues extends PropertySum {
        readonly ace = 1
        readonly jack = 11
        readonly queen = 12 
        readonly king = 13
    }

    const five = new class Five extends LiteralValue {
        readonly value = 5 as const
    }

    class X2 extends Multiplier {

        constructor(readonly value: Multiplier['value']) {
            super()
            hideNonStateKeys(this, 'value')
        }

        readonly by = 2 as const
    }

    class CustomMultiplier extends StatefulMultiplier {

        constructor(readonly value: Multiplier['value'], readonly by: number) {
            super()
        }

        set [$$state](state: { value: Multiplier['value'], by: number }) {
            assign(this, state)
        }

    }

    test('card struct', () => {
        expect(cards()).toEqual(37)
        expect(getState(cards)).toEqual({ ace: 1, jack: 11, queen: 12, king: 13 })

        // @ts-expect-error 'ace' is not a state key
        applyState(cards, { ace: 1 })

        type CardState = State<typeof cards>
        expectTypeOf<CardState>().toEqualTypeOf<Empty>()
    })

    test('five struct', () => {
        expect(five()).toEqual(5)
        expect(getState(five)).toEqual({ value: 5 })

        // @ts-expect-error 'value' is not a state key
        applyState(five, { value: 5 })

        type FiveState = State<typeof five>
        expectTypeOf<FiveState>().toEqualTypeOf<Empty>()
    })

    test('x2 struct', () => {

        const ten = new X2(5)

        expect(ten()).toEqual(10)
        expect(getState(ten)).toEqual({ by: 2 })

        // @ts-expect-error 'by' is not a state key
        applyState(ten, { by: 2 })

        type TenState = State<typeof ten>
        expectTypeOf<TenState>().toEqualTypeOf<Empty>()

        const x2Cards = new X2(cards)
        expect(x2Cards()).toEqual(cards() * 2)
    })

    test('stateful multiplier', () => {

        const fifteen = new class MultiplyFive extends StatefulMultiplier {

            get value(): typeof five {
                return five
            }

            readonly by = 3
        }

        expect(fifteen()).toEqual(15)
        expect(getState(fifteen)).toEqual({ by: 3 })

        type FifteenState = State<typeof fifteen>
        expectTypeOf<FifteenState>().toEqualTypeOf<{ by: number }>()

        const ten = applyState(fifteen, { by: 2 })
        expect(ten()).toEqual(10)
        expect({ ...ten }).toEqual({ by: 2 })

        type TenState = State<typeof ten>
        expectTypeOf<TenState>().toEqualTypeOf<{ by: number }>()

    })

    test('custom multiplier', () => {

        const six = new CustomMultiplier(2, 3)

        expect(six()).toEqual(6)
        expect(getState(six)).toEqual({ value: 2, by: 3 })
        expect({ ...six }).toEqual({ value: 2, by: 3 })

        type SixState = State<typeof six>
        expectTypeOf<SixState>().toEqualTypeOf<{ 
            by: number
            value: number | { valueOf(): number }
        }>()

        const twelve = applyState(six, { value: 4 })
        expect(twelve()).toEqual(12)
        expect(getState(twelve)).toEqual({ value: 4, by: 3 })
        expect({ ...twelve }).toEqual({ value: 4, by: 3 })

    })

    const composite = new class Composite extends PropertySum {

        readonly cards = cards

        readonly five = five 

        readonly custom = new CustomMultiplier(new X2(2), 2)

        get [$$state](): Pick<this, 'cards' | 'five' | 'custom'> {
            return { ...this }
        }
    } 

    test('deep getState()', () => {

        expect(getState(composite)).toEqual({
            cards: {
                ace: 1,
                jack: 11,
                king: 13,
                queen: 12
            },
            five: { value: 5 },
            custom: { value: { by: 2 }, by: 2 }
        })

        type CompositeState = State<typeof composite>
        expectTypeOf<CompositeState>().toEqualTypeOf<{
            cards: Empty
            five: Empty
            custom: {
                by: number
                value: number | { valueOf(): number }
            }
        }>()

        expect(composite()).toEqual(50)

    })

    test('deep setState()', () => {

        const composite2 = applyState(composite, {
            custom: {
                value: 15,
            }
        })

        expect(composite2()).toBe(72)
        expect(getState(composite2)).toEqual({
            cards: {
                ace: 1,
                jack: 11,
                king: 13,
                queen: 12
            },
            five: { value: 5 },
            custom: { value: 15, by: 2 }
        })

    }) 

    test('double deep setState()', () => {

        const fifty = new class CashDrawer extends PropertySum {
            readonly wallet = new class TenDollaBillz extends Multiplier {

                readonly by = 5
                readonly value = new class Dollars extends LiteralValue {
                    readonly value: number = 10

                    get [$$state](): Pick<this, 'value'> {
                        return { ...this }
                    }
                }

                get [$$state](): Pick<this, 'value'> {
                    return { ...this }
                }

            }

            get [$$state](): Omit<this, 'valueOf' | typeof $$state | 'name'> {
                return { ...this }
            }
        }

        expect(getState(fifty)).toEqual({
            wallet: {
                by: 5,
                value: {
                    value: 10
                }
            }
        })

        const oneTwentyFive = applyState(
            fifty, 
            {
                wallet: {
                    value: { 
                        value: 25
                    }
                }
            }
        )

        type CashDrawerState = State<typeof fifty>
        expectTypeOf<CashDrawerState>().toEqualTypeOf<{
            readonly wallet: {
                readonly value: {
                    readonly value: number
                }
                readonly by: 5
            }
        }>

        const oneTwentyFiveState = getState(oneTwentyFive)
        expect(fifty()).toEqual(50)
        expect(oneTwentyFive()).toEqual(125)
        expect(oneTwentyFiveState).toEqual({
            wallet: {
                value: { 
                    value: 25
                },
                by: 5
            }
        })
    })
})

describe('applyState deep keys', () => {

    it('allows deep setting of a state via a path', () => {

        class Value extends PublicStruct {
            constructor(readonly value: number) {
                super()
            }
        }

        const black = new class Color extends PublicStruct {

            readonly red = new Value(0)

            readonly green = new Value(0)

            readonly blue = new Value(0)

            readonly alpha = new class Alpha extends PublicStruct {
                readonly alpha: number = 255
            }

            toString(): `rgb(${number}, ${number}, ${number})` {
                return `rgb(${this.red.value}, ${this.green.value}, ${this.blue.value})`
            }
        }

        const blue = applyState(black, { blue: { value: 255 } })
        expect(getState(blue)).toEqual({
            red: { value: 0 },
            green: { value: 0 },
            blue: { value: 255 },
            alpha: { alpha: 255 }
        })

        const red = applyState(black, 'red', { value: 255 })
        expect(getState(red)).toEqual({
            red: { value: 255 },
            green: { value: 0 },
            blue: { value: 0 },
            alpha: { alpha: 255 },
        })

        const green = applyState(black, 'green', 'value', 255)
        expect(getState(green)).toEqual({
            red: { value: 0 },
            green: { value: 255 },
            blue: { value: 0 },
            alpha: { alpha: 255 },
        })

    })

})
