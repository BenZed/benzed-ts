import each from './each'
import { it, expect, test, describe } from '@jest/globals'

//// Setup ////

const $$base = Symbol('base')
const $$public = Symbol('enumerable')
const $$private = Symbol('non-enumerable')
const $$extend = Symbol('extends')

class Base {
    
    get base() {
        return Base 
    }

    getBase() { 
        return Base 
    }

    overrideMe() {
        throw new Error('Must be overridden')
    }

    protected [$$base]() {
        return Base 
    } 

    constructor() {
        Object.defineProperty(this, $$private, { value: 'private' })
    }
}

class Extend extends Base {

    [$$public] = 'public'

    value = $$extend

    get extend() {
        return Extend
    }

    getExtend() {
        return Extend
    }

    override overrideMe(): void {
        //
    }

    protected [$$extend]() {
        return Extend
    }

}

const extend = new Extend()

//// Tests ////

it('each', () => {
    expect(each([1], ['ace']).toArray()).toEqual([1,'ace'])
}) 

describe('each.keyOf', () => {

    it('each enumerable inherited key of object', () => { 
        expect([...each.keyOf(extend)]).toEqual(['value', $$public])
    })
  
    it('each enumerable own key of object', () => {
        expect([...each.own.keyOf(extend)]).toEqual(['value', $$public])
    })

    it('each defined inherited key of object', () => {
        expect([...each.defined.keyOf(extend)]).toEqual([
            'value', 
            $$private, 
            $$public, 
            'constructor', 
            'extend', 
            'getExtend', 
            'overrideMe', 
            $$extend, 
            'base', 
            'getBase',
            $$base
        ])
    })

    it('each defined own key of object', () => {
        expect([...each.defined.own.keyOf(extend)]).toEqual(['value', $$private, $$public])
        expect([...each.own.defined.keyOf(extend)]).toEqual(['value', $$private, $$public]) 
    })

})

describe('each.nameOf', () => {

    it('each enumerable inherited name of object', () => { 
        expect([...each.nameOf(extend)]).toEqual(['value'])
    })
  
    it('each enumerable own name of object', () => {
        expect([...each.own.nameOf(extend)]).toEqual(['value'])
    })

    it('each defined inherited name of object', () => {
        expect([...each.defined.nameOf(extend)]).toEqual([
            'value', 
            'constructor', 
            'extend', 
            'getExtend', 
            'overrideMe', 
            'base', 
            'getBase',
        ])
    })

    it('each defined own name of object', () => {
        expect([...each.defined.own.nameOf(extend)]).toEqual(['value'])
        expect([...each.own.defined.nameOf(extend)]).toEqual(['value']) 
    })

}) 

describe('each.symbolOf', () => {

    it('each enumerable inherited key of object', () => { 
        expect([...each.symbolOf(extend)]).toEqual([$$public])
    })
  
    it('each enumerable own key of object', () => {
        expect([...each.own.symbolOf(extend)]).toEqual([$$public])
    })

    it('each defined inherited key of object', () => {
        expect([...each.defined.symbolOf(extend)]).toEqual([
            $$private, 
            $$public, 
            $$extend, 
            $$base
        ])
    })

    it('each defined own key of object', () => {
        expect([...each.defined.own.symbolOf(extend)]).toEqual([ $$private, $$public ])
        expect([...each.own.defined.symbolOf(extend)]).toEqual([ $$private, $$public ]) 
    })

})
