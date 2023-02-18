
import { Trait } from '@benzed/traits'
import { Struct } from './struct'

//// Setup ////

class Vector extends Trait.use(Struct) {
    
    constructor(readonly x = 0, readonly y = 0) {
        super()
    }

    get [Struct.stateKeys](): ['x', 'y'] {
        return ['x', 'y']
    }

}

//// Tests ////

describe('Struct', () => { 

    describe('copy', () => {

        it('creates an immutably copied object', () => {
            const v1 = new Vector(2, 2)
            const v2 = v1[Struct.copy]()
            expect(v1).not.toBe(v2)
            expect(v1).toEqual(v2)
        })

    })

    describe('equals', () => { 

        it('returns true if two stateful objects of the same type have equal states', () => {
            const v1 = new Vector(2, 2)
            const v2 = new Vector(2, 2)
            const v3 = new Vector(3, 3)

            expect(v1[Struct.equals](v2)).toBe(true)
            expect(v1[Struct.equals](v3)).toBe(false)
        })
    })

    describe('apply', () => {
        it('creates an immutably copied object with a modified state', () => {
            const v1 = new Vector(2, 2) 
            const v2 = Struct.apply(v1, { x: 3 })
            expect(v1).not.toBe(v2)
            expect(v1).toEqual(new Vector(2, 2))
            expect(v2).toEqual(new Vector(3, 2))
        })
    })

    describe('deep set', () => {
        it('updates the stateful object with a nested state', () => {

            class Shape extends Trait.use(Struct) {
  
                constructor(readonly color = 'black', readonly position = new Vector) {
                    super()
                }

                get [Struct.stateKeys]() {
                    return ['color', 'position'] as const
                }
            }
  
            const shape = new Shape('blue', new Vector(1, 2))
  
            Struct.set(shape, {
                color: 'red',
                position: { x: 2 }
            })
  
            expect(shape.color).toBe('red')
            expect(shape.position).toEqual(new Vector(2, 2))
        }) 
  
    })
  
})