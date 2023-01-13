import { nil, toVoid } from '@benzed/util'
import Struct, { CallableStruct } from './struct'

//// Setup ////

class Scalar extends Struct {
    constructor(protected value: number) {
        super()
    }
}  

//// Data ////

const scalar = new Scalar(10)
 
//// Tests //// 

describe('copy()', () => {
    test('copies', () => {
        expect(scalar.copy()).not.toBe(scalar)
    })

    it('is bound', () => {
        const [ s2 ] = [scalar].map(scalar.copy)
        expect(s2.equals(scalar)).toBe(true)
    })
    
})

describe('equals()', () => {
    it('compares', () => {
        expect(scalar.copy().equals(scalar)).toBe(true)
    })

    it('is bound', () => {
        expect([scalar.copy()].some(scalar.equals)).toEqual(true)
    })
})

test('instanceof', () => {
    expect(scalar).toBeInstanceOf(scalar.constructor)
    expect(scalar.copy()).toBeInstanceOf(scalar.constructor)
})

it('Struct.bind', () => {
    const dangly = new class Dangly extends Struct {
        getThis(): this {
            return this
        }
    }

    const { getThis } = dangly 
    expect(getThis()).toEqual(nil)

    const getThisBound = Struct.bindMethods(dangly, 'getThis').getThis
    expect(getThisBound()).toBe(dangly)
})

//// Works with methods ////

class Multiply extends CallableStruct<(i: number) => number> {
    constructor(public by: number) {
        super(i => i * this.by)
    } 
}

test('CallableStruct', () => {
    const x2 = new Multiply(2)
    expect(x2.by).toEqual(2)
    expect(x2(2)).toEqual(4)
 
    expect(x2.copy()).not.toBe(x2) 
    expect(x2).toBeInstanceOf(Multiply)
    expect(x2).toBeInstanceOf(Struct)

    expect(x2.copy().equals(x2)).toBe(true)
})  

it('CallableStruct.bindMethods', () => {
    const dangly = new class Dangly extends CallableStruct<() => void> {

        constructor() {
            super(toVoid)
        }
    
        getThis(): this {
            return this
        }  
    }

    const { getThis } = dangly
    expect(getThis()).toEqual(nil)

    const getThisBound = Struct.bindMethods(dangly, 'getThis').getThis

    expect(getThisBound()).toBe(dangly) 
})
