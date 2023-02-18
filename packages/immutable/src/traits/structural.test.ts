
import { Trait } from '@benzed/traits'
import { assign, pick } from '@benzed/util'

import { Stateful } from './stateful'
import { Structural } from './structural'

//// Setup ////

class Vector extends Trait.use(Structural) {
    
    constructor(readonly x = 0, readonly y = 0) {
        super()
    }

    get [Structural.key]() {
        return pick(this, 'x', 'y')
    }

    set [Structural.key](value) {
        assign(this, value)
    }
} 

class Shape extends Trait.use(Structural) {
  
    constructor(readonly color = 'black', readonly position = new Vector) {
        super()
    }

    get [Stateful.key]() {
        return pick(this, 'color', 'position')
    }

    set [Stateful.key](value) {
        assign(this, value)
    }

}

//// Tests ////

describe('Struct.copy', () => {

    it('creates an immutably copied object', () => {
        const v1 = new Vector(2, 2)
        const v2 = v1[Structural.copy]()
        expect(v1).not.toBe(v2)
        expect(v1).toEqual(v2)
    })

})

describe('Struct.equals', () => {

    it('returns true if two stateful objects of the same type have equal states', () => {
        const v1 = new Vector(2, 2)
        const v2 = new Vector(2, 2)
        const v3 = new Vector(3, 3)

        expect(v1[Structural.equals](v2)).toBe(true)
        expect(v1[Structural.equals](v3)).toBe(false)
    })
})

describe('Struct.get', () => {

    it('get deep state', () => {
        const shape = new Shape('blue', new Vector(1, 2))

        const state = shape[Stateful.key]
        expect(state).toEqual({
            color: 'blue',
            position: new Vector(1, 2)
        })

        const deepState = Structural.getIn(shape)
        expect(deepState).toEqual({
            color: 'blue',
            position: {
                x: 1, 
                y: 2
            }
        })
    })

    it('get at path', () => {

        const shape = new Shape('grey', new Vector(10, 10))

        const position = Structural.getIn(shape, 'position')
        expect(position).toEqual({ x: 10, y: 10 })

        const x = Structural.getIn(shape, 'position', 'x')
        expect(x).toEqual(10)

    })

    it('throws at invalid paths', () => {

        const shape = new Shape('grey', new Vector(10, 10))
        expect(() => Structural.getIn(shape, 'ace')).toThrow('Invalid state')
        expect(() => Structural.getIn(shape, 'ace', 'base')).toThrow('Invalid state')

    })
})

describe('Struct.set', () => {

    it('set deep state', () => {

        const shape = new Shape('green', new Vector(0,0))

        Structural.setIn(
            shape,
            {
                color: 'red',
                position: { x: 2 }
            }
        )

        expect(shape.color).toBe('red')
        expect(shape.position).toEqual(new Vector(2, 0))
    })

    it('set deep state at path', () => {

        const shape = new Shape('red', new Vector(5,5))

        Structural.setIn(shape, 'color', 'orange')  
        expect(shape.color).toBe('orange')

        Structural.setIn(shape, 'position', { x: 10 }) 
        expect(shape.position).toBeInstanceOf(Vector)
        expect(shape.position.x).toBe(10)

        Structural.setIn(shape, 'position', 'y', 7)
        expect(shape.position).toBeInstanceOf(Vector)
        expect(shape.position.y).toBe(7)
    })

})

describe('Struct.apply', () => {

    it('creates an immutably copied object with a modified state', () => {
        const v1 = new Vector(2, 2) 
        const v2 = Structural.apply(v1, new Vector(3, 3))
        expect(v1).not.toBe(v2)
        expect(v1).toEqual(new Vector(2, 2))
        expect(v2).toEqual(new Vector(3, 3))
    })

    it('state can be applied deeply', () => { 

        const shape = new Shape('turquoise', new Vector(10,10))

        const shape2 = Structural.apply(shape, { position: { y: 5 } })
        expect(shape2).not.toBe(shape)

        expect(Structural.getIn(shape2)).toEqual({
            color: 'turquoise',
            position: {
                x: 10,
                y: 5
            }
        })
    })

    it('nested state can be applied deeply', () => { 

        const shape = new Shape('orange', new Vector(10,10))

        const shape2 = Structural.apply(shape, 'position', { x: 2 })

        expect(shape2).not.toBe(shape)
        expect(Structural.getIn(shape2)).toEqual({
            color: 'orange',
            position: {
                x: 2,
                y: 10
            }
        })
    })
})
