
import { isFunc, isShape } from '@benzed/util'
import { it, expect, describe } from '@jest/globals'
import { Trait } from './trait'

//// Setup ////

abstract class Jumpable extends Trait {

    static is: (input: unknown) => input is Jumpable = isShape({
        jump: isFunc
    })

    abstract jump(): boolean 
}

abstract class Duckable extends Trait { 

    static is: (input: unknown) => input is Duckable = isShape({
        duck: isFunc
    })

    abstract duck(): boolean 

}

class Coordinates {
    constructor(public x: number, public y: number) {}
}

class Sprite extends Trait.add(Coordinates, Jumpable, Duckable) {

    jump(): boolean {
        return false
    }

    duck(): boolean {
        return true
    }

}

describe('creates composite classes', () => {

    let sprite: Sprite
    beforeAll(() => {
        sprite = new Sprite(0, 5)
    })

    it('extends Coordinates', () => { 
        expect(sprite.x).toBe(0) 
        expect(sprite.y).toBe(5) 
        expect(sprite).toBeInstanceOf(Coordinates)
    })

    it('extends sprite', () => {
        expect(sprite).toBeInstanceOf(Sprite)
    })

    it('extends traits', () => {
        expect(sprite).toBeInstanceOf(Jumpable)
        expect(sprite).toBeInstanceOf(Duckable)
    })

    it('bad trait type error', () => { 

        class NotATrait<T> {
            constructor(readonly state: T) {}
        }
 
        // @ts-expect-error NotATrait invalid constructor signature
        void class Bad extends Trait.add(Coordinates, NotATrait) {}
    })

})

