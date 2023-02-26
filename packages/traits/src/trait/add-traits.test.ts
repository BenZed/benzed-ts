
import { AnyTypeGuard, isEqual, isFunc, isShape, isString } from '@benzed/util'
import { it, expect, describe } from '@jest/globals'
import { Trait } from './trait'

//// Setup ////

describe('creates composite classes', () => {

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

describe('onApply', () => {
     
    abstract class Emotional extends Trait {

        static is: (input: unknown) => input is Emotional = isShape({
            emotion: isEqual('Happy', 'Sad'),
        }) as AnyTypeGuard

        applies: number

        static [Trait.onApply](emotional: Emotional) {
            emotional.applies ??= 0
            emotional.applies++
            emotional.emotion = 'Happy'
        }

        emotion: 'Happy' | 'Sad'
    }

    class Occupational extends Trait { 

        static is: (input: unknown) => input is Emotional = isShape({
            job: isString,
        }) as AnyTypeGuard

        applies: number 

        static [Trait.onApply](occupational: Occupational) {
            occupational.applies ??= 0
            occupational.applies++
            occupational.job ??= 'unemployed'
        }

        job: string
    }

    class Person extends Trait.use(Emotional) {}

    class EmployedPerson extends Trait.add(Person, Occupational) {}

    test('apply traits', () => {  
        const person = new Person()
        expect(person.emotion).toBe('Happy')
        expect(person.applies).toBe(1)
        expect(Person.prototype[Trait.onApply]).not.toBe(undefined)
    })
    
    test('apply traits on extended classes', () => { 
        const worker = new EmployedPerson()
        expect(worker.applies).toBe(2)
        expect(worker.job).toBe('unemployed')
        expect(worker.emotion).toBe('Happy')
    })
})