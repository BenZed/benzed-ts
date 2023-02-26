import { Mutator } from './mutator'

import { test, expect } from '@jest/globals'
import Mutate from './mutate'
import { Trait } from '../trait'

//// Tests ////

test('Simple Example', () => {

    class Damage {

        constructor(readonly amount: number) {}
    
    }
    
    class Double extends Mutator<Damage> {
    
        get amount() {
            return this[Mutate.target].amount * 2
        }
    
    }

    const x2 = new Double(new Damage(5)) 
    expect(x2.amount).toEqual(10)

})

test('Trait Overload example', () => {

    abstract class Price extends Trait {

        abstract get base(): number

        abstract get tax(): number

        get amount(): number {
            return this.base * (1 + this.tax)
        }

    }

    class Sign extends Trait.use(Price) {

        constructor(readonly base: number, readonly tax: number) {
            super()
        }

    }

    class Coupon extends Mutator<Price> {
        constructor(readonly discount: number, target: Price) {
            super(target)
        }

        get amount(): number {
            return this[Mutate.target].amount * this.discount
        }
    }

    const sign = new Sign(100, 0.17)

    const cheapSign = new Coupon(0.5, sign)

    expect(sign.amount).toBe(117)
    expect(cheapSign.amount).toBe(58.5)

})

describe('traps', () => {

    class Target {
        targetOnly = 0
        shared = 0

        targetOnlyMethod() {
            return this.targetOnly
        }

    }
    
    class Mod extends Mutator<Target> {
        shared = 1
        modOnly = 1
    }

    const mod = new Mod(new Target()) as any

    it.only('get', () => {
        expect(mod.shared).toBe(1)
        expect(mod.targetOnly).toBe(0)
        expect(mod.modOnly).toBe(1)
        expect(mod.targetOnlyMethod()).toEqual(0)
    })

    it('has', () => {
        expect('targetOnly' in mod).toBe(true)
        expect('shared' in mod).toBe(true)
        expect('modOnly' in mod).toBe(true)
    })

})