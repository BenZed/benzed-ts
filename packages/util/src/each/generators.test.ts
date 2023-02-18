import { eachKey, KeyType } from './generators'

import { it, expect, } from '@jest/globals'

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

//// Tests ////

const extend = new Extend()

it('each enumerable inherited name (key..in)', () => {
    const keys = eachKey(extend, { type: KeyType.Name, enumerable: true, own: false, })
    expect(Array.from(keys)).toEqual(['value'])
})

it('each enumerable own name', () => {
    const keys = eachKey(extend, { type: KeyType.Name, enumerable: true, own: true, })

    expect(Array.from(keys))
        .toEqual(['value'])
})

it('each defined inherited name', () => {
    const keys = eachKey(extend, { type: KeyType.Name, enumerable: false, own: false, })

    expect(Array.from(keys))
        .toEqual(['value', 'constructor', 'extend', 'getExtend', 'overrideMe', 'base', 'getBase'])
})

it('each defined own name', () => {
    const keys = eachKey(extend, { type: KeyType.Name, enumerable: false, own: true })

    expect(Array.from(keys))
        .toEqual(['value'])
})

it('each enumerable own symbol', () => {
    const keys = eachKey(extend, { type: KeyType.Symbol, enumerable: true, own: true })

    expect(Array.from(keys))
        .toEqual([$$public])
})

it('each enumerable inherited symbol', () => {
    const keys = eachKey(extend, { type: KeyType.Symbol, enumerable: true, own: false })

    expect(Array.from(keys))
        .toEqual([$$public])
})
    
it('each defined inherited symbol', () => {
    const keys = eachKey(extend, { type: KeyType.Symbol, enumerable: false, own: false })

    expect(Array.from(keys))
        .toEqual([$$private, $$public, $$extend, $$base])
})

it('each defined own symbol', () => {
    const keys = eachKey(extend, { type: KeyType.Symbol, enumerable: false, own: true })

    expect(Array.from(keys))
        .toEqual([$$private, $$public])
})

it('each enumerable own key', () => {
    const keys = eachKey(extend, { type: KeyType.Key, enumerable: true, own: true })

    expect(Array.from(keys))
        .toEqual(['value', $$public])
})

it('each enumerable inherited key', () => {
    const keys = eachKey(extend, { type: KeyType.Key, enumerable: true, own: false })

    expect(Array.from(keys))
        .toEqual(['value', $$public])
})
    
it('each defined inherited key', () => {  
    const keys = eachKey(extend, { type: KeyType.Key, enumerable: false, own: false })

    expect(Array.from(keys))
        .toEqual([
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

it('each defined own key', () => {
    const keys = eachKey(extend, { type: KeyType.Key, enumerable: false, own: true })

    expect(Array.from(keys))
        .toEqual(['value', $$private, $$public])
})

