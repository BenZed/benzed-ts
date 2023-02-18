import { DeepStateOf, DeepStateUpdate, State } from './state'

import { assign, pick, Trait } from '@benzed/util'
import { StateOf } from './stateful'

//// Setup ////

class Vector extends Trait.use(State) {
    
    constructor(readonly x = 0, readonly y = 0) {
        super()
    }

    get [State.key](): Pick<this, 'x' | 'y'> {
        return pick(this, 'x', 'y') 
    }

    set [State.key](state: Pick<this, 'x' | 'y'>) {
        assign(this, state)
    }

}

//// Tests ////

describe('State', () => { 

    describe('copy', () => {

        it('creates an immutably copied object', () => {
            const v1 = new Vector(2, 2)
            const v2 = v1[State.copy]()
            expect(v1).not.toBe(v2)
            expect(v1).toEqual(v2)
        })

    })

    describe('equals', () => { 

        it('returns true if two stateful objects of the same type have equal states', () => {
            const v1 = new Vector(2, 2)
            const v2 = new Vector(2, 2)
            const v3 = new Vector(3, 3)

            expect(v1[State.equals](v2)).toBe(true)
            expect(v1[State.equals](v3)).toBe(false)
        })
    })

    describe('apply', () => {
        it('creates an immutably copied object with a modified state', () => {
            const v1 = new Vector(2, 2)
            const v2 = State.apply(v1, { x: 3, y: 2 })
            expect(v1).not.toBe(v2)
            expect(v1).toEqual(new Vector(2, 2))
            expect(v2).toEqual(new Vector(3, 2))
        })
    })

    describe('deep set', () => {
        it('updates the stateful object with a nested state', () => {
            class Vector extends Trait.use(State) {
                constructor(readonly x = 0, readonly y = 0) {
                    super()
                }
                get [State.key](): Partial<Pick<this, 'x' | 'y'>> {
                    return pick(this, 'x', 'y')
                }
                set [State.key](state: Partial<Pick<this, 'x' | 'y'>> ) {
                    assign(this, state)
                }
            }
  
            class Shape extends Trait.use(State) {
  
                constructor(readonly color = 'black', readonly position = new Vector) {
                    super()
                }
  
                get [State.key](): { color: string, position: StateOf<Vector> } {
                    return State.get({ ...this }) as { color: string, position: StateOf<Vector> }
                }
  
                set [State.key](state: { color: string, position: StateOf<Vector> }) {

                    const filled = State.set({ ...this }, state as DeepStateUpdate<this>)
                    assign(this, filled)
                }
  
            }
  
            const shape = new Shape('blue', new Vector(1, 2))
  
            State.set(shape, {
                color: 'red',
                position: { x: 2 }
            })
  
            expect(shape.color).toBe('red')
            expect(shape.position).toEqual(new Vector(2, 2))
        }) 
  
    })
  
})