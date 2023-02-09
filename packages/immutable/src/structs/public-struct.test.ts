import { PublicStruct } from './public-struct'

import {

    $$state,
    applyState,
    getDeepState,
    State,

} from '../state'

import { assign } from '@benzed/util'

import { it, expect, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import Struct from '../struct'

//// Tests ////

test(`${PublicStruct.name}`, () => {

    const v1 = new class Vector extends PublicStruct {
        readonly x: number = 0
        readonly y: number = 0
    }

    const edge = new class Edge extends PublicStruct {
        readonly a = v1
        readonly b = v1
    }

    const le1 = edge.set('b', { y: 10 })

    const le2 = edge.set('b', 'y', 10)

    expect(getDeepState(le1)).toEqual({
        a: { x: 0, y: 0 },
        b: { x: 0, y: 10 } 
    })

    expect(getDeepState(le1)).toEqual(getDeepState(le2))

    expect(le1).not.toBe(edge)  
})

describe('isStructural', () => {
    it('returns true for any structural body, doesn\'t need to inherit from struct', () => {
        class TwinTurbo extends Struct {
            readonly turbos: number = 2
        }

        expect(Struct.is(new TwinTurbo())).toBe(true)

        expect(Struct.is({ x: 0 })).toBe(false)  
    })
})

describe('applyState deep keys', () => {

    class Value extends PublicStruct {
        constructor(readonly value: number) {
            super()
        }
    }

    const black = new class Color extends PublicStruct {

        readonly red = new Value(0)
        readonly green = new Value(0)
        readonly blue = new Value(0)

        toString(): `rgb(${number}, ${number}, ${number})` {
            return `rgb(${this.red.value}, ${this.green.value}, ${this.blue.value})`
        }
    }

    it('allows deep setting of a state via a path', () => {

        const blue = applyState(black, { blue: { value: 255 } })
        expect(getDeepState(blue)).toEqual({
            red: { value: 0 },
            green: { value: 0 },
            blue: { value: 255 },
        })

        const red = applyState(black, 'red', { value: 255 })

        expect(getDeepState(red)).toEqual({
            red: { value: 255 },
            green: { value: 0 },
            blue: { value: 0 },
        })

        const green = applyState(black, 'green', 'value', 255)
        expect(getDeepState(green)).toEqual({
            red: { value: 0 },
            green: { value: 255 },
            blue: { value: 0 },
        })

    })

    it('paths are typesafe', () => {
        try {

            // @ts-expect-error Bad path
            void applyState(black, 'green', 255)

            // @ts-expect-error Bad value
            void applyState(black, 'red', 'value', { value: 1000 })

        } catch {} 
    })
})

describe('scalar state', () => {

    class Scalar<T> extends Struct {

        constructor(readonly value: T) {
            super()
        }

        get [$$state](): T {
            return this.value 
        }

        protected set [$$state](value: T) {
            assign(this, { value })
        } 

    }
    
    it('structs can define non-object state with setters', () => {

        const zero = new Scalar(0)

        const zeroState = getDeepState(zero)
        expect(zeroState).toEqual(0)
        expect({ ...zero }).toEqual({ value: 0 })

        const one = applyState(zero, 1)
        expect(getDeepState(one)).toEqual(1)
        expect({ ...one }).toEqual({ value: 1 })

    })

    it('scalar states work on nested assignments', () => {

        const scalars = new class Scalars extends PublicStruct {
            min = new Scalar(100)
            max = new Scalar(150)
            description = new Scalar('a couple of scalar values')
        }

        type ScalarsState = State<typeof scalars>
        expectTypeOf<ScalarsState>().toEqualTypeOf<{
            description: string
            min: number
            max: number
        }>()

        expectTypeOf(getDeepState(scalars).description).toEqualTypeOf<string>()
        expectTypeOf(getDeepState(scalars).min).toEqualTypeOf<number>()
        expectTypeOf(getDeepState(scalars).max).toEqualTypeOf<number>()
        expect(getDeepState(scalars)).toEqual({
            min: 100,
            max: 150,
            description: 'a couple of scalar values'
        })

        const scalarAbbrev1 = applyState(scalars, 'description', 'short')
        expect(getDeepState(scalarAbbrev1)).toEqual({ 
            min: 100,
            max: 150,
            description: 'short'
        })

        const scalarAbbrev2 = applyState(scalars, { description: 'and sweet' })
        expect(getDeepState(scalarAbbrev2)).toEqual({ 
            min: 100,
            max: 150,
            description: 'and sweet'
        })
    })
})
