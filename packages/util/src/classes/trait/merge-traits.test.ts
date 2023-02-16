
import { it, expect } from '@jest/globals'
import { isFunc, isNumber, isShape, isString } from '../../types'
import { _AllSymbolsOf } from './merge-traits'
import { Trait } from './trait'

//// Tests ////

abstract class Damage extends Trait {

    static readonly is: (input: unknown) => input is Damage = isShape({
        damage: isFunc,
    })

    abstract damage(): number

}

abstract class Weight extends Trait { 

    static readonly is: (input: unknown) => input is Weight = isShape({
        weight: isNumber
    })

    abstract get weight(): number

}

abstract class Material extends Trait {

    static readonly is: (input: unknown) => input is Material = isShape({
        material: isString,
    })

    abstract get material(): string

}

abstract class Weapon extends Trait.merge(Damage, Weight, Material) {

}

class Sword extends Trait.use(Weapon) {

    readonly material = 'Steel'

    readonly weight = 20

    damage(): number {
        return 10
    }
}

//// Test ////

it('inherits all traits', () => {

    const sword = new Sword()

    expect(sword instanceof Weapon).toBe(true)
    expect(sword instanceof Damage).toBe(true)
    expect(sword instanceof Material).toBe(true)
})

it('combines symbolic static properties', () => {

    const $$poison = Symbol('poison')

    class Poison extends Trait {

        static poison: typeof $$poison = $$poison

        get [$$poison](): string {
            return 'You are poisoned.'
        }

    }  

    const $$holy = Symbol('holy')
    class Holy extends Trait {

        static holy: typeof $$holy = $$holy

        get [$$holy](): string {
            return 'You are holy'
        }
    }

    class HolyPoison extends Trait.merge(Holy, Poison) {}

    expect(HolyPoison.poison).toEqual($$poison) 
    expect(HolyPoison.holy).toEqual($$holy)

})

it('composite name', () => { 

    const Merged = Trait.merge(Damage, Weight, Material)

    expect(Merged.name).toBe('DamageWeightMaterial')
})
