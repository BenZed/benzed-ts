import { $$state, Struct } from './struct'

import { assign, pick } from '@benzed/util'

import { it, expect, describe } from '@jest/globals'

import { copy } from './copy'
import { equals } from './equals'

//// Tests ////

describe('basic object struct, no state overrides', () => {

    class Value<T> extends Struct {

        constructor(readonly value: T) {
            super()
        }
    
    }

    const f1 = new Value(5)
    const f2 = copy(f1)

    it('get state', () => {
        expect(f1[$$state]).toEqual({ value: 5})
    })

    it('set state', () => {
        const f3 = new Value(2)

        f3[$$state] = { value: 5 }

        expect(f3).toEqual(f1)
    })

    it('apply state', () => {
        const f3 = Struct.applyState(f2, { value: 5 })
        expect(f3[$$state]).toEqual({ value: 5 })
    })
    
    it('copyable', () => {

        expect(f2).toEqual(f1)
        expect(f2).not.toBe(f1)
    })

    it('equalable', () => {
        expect(equals(f1,f2)).toBe(true)

        const s1 = new Value(6)

        expect(equals(s1,f1)).not.toBe(true)
    })

})

describe('basic object struct, with overrides', () => {

    class Average extends Struct {

        readonly scores: number[]

        readonly average: number

        constructor(...scores: number[]) {
            super()
            this.scores = scores
            this.average = 0
            this._updateAverage()
        }

        override get [$$state](): { scores: number[] } {
            return pick(this, 'scores')
        }

        override set [$$state](state: { scores: number[] }) {
            assign(this, pick(state, 'scores'))
            this._updateAverage()
        }

        // 

        private _updateAverage(): void {
            const average = this.scores.reduce((sum, val) => val + sum) / this.scores.length
            assign(this, { average })
        }

    }

    const a1 = new Average(5, 10, 15)
    const a2 = copy(a1)

    it('get state', () => {
        expect(a1[$$state]).toEqual({ scores: [ 5, 10, 15 ] })
        expect(a1.average).toEqual(10)
    })

    it('set state', () => {
        const a3 = new Average(2)

        a3[$$state] = { scores: [7,7,7] }

        expect(a3.average).toEqual(7)
        expect(a3[$$state]).toEqual({ scores: [7,7,7] })
    })

    it('apply state', () => {
        const a3 = Struct.applyState(a2, { scores: [4,4,4] })
        expect(a3[$$state]).toEqual({ scores: [ 4,4,4 ]})
        expect(a3).not.toBe(a2)
    })

    it('copyable', () => {
        expect(a2).toEqual(a1)
        expect(a2).not.toBe(a1)
    })

    it('equalable', () => {
        expect(equals(a1,a2)).toBe(true)
        const a3 = new Average(6)
        expect(equals(a3,a1)).not.toBe(true)
    })

})

describe('callable struct, no overrides', () => {

    class Multiply extends Struct<(input: number) => number> {
        constructor(readonly by: number) {
            super(function(i) {
                return i * this.by
            })
        }
    }
    const x2a = new Multiply(2)
    const x2b = copy(x2a)

    it('callable', () => {
        const x2 = new Multiply(2)
        expect(x2(5)).toEqual(10)
    })

    it('get state', () => {
        expect(x2a[$$state]).toEqual({ by: 2 })
    })
    
    it('set state', () => {

        const x4 = new Multiply(2)

        x4[$$state] = { by: 4 }
    
        expect(x4(5)).toEqual(20)
        expect(x4[$$state]).toEqual({ by: 4 })
    })

    it('apply state', () => {

        const x4c = Struct.applyState(x2a, { by: 4 })

        expect(x4c[$$state]).toEqual({ by: 4 })
        expect(x4c(5)).toEqual(20)
        expect(x4c).not.toBe(x2a)

    })

    it('equalable', () => {
        expect(equals(x2b, x2a)).toBe(true)
    })

    it('copyable', () => {
        expect(equals(x2b, x2a)).toBe(true)
        expect(x2b).not.toBe(x2a)
    })

})

describe('callable struct, no overrides', () => {

    class Task extends Struct<() => boolean> {

        constructor(
            readonly complete: boolean,
            readonly description: string,
            public observerIds: number[]
        ) {
            super(function () {
                return this.complete
            })
        }
        
        get [$$state](): { complete: boolean, description: string } {
            return pick(this, 'complete', 'description')
        }

        set [$$state](state: { complete: boolean, description: string }) {
            assign(this, pick(state, 'complete', 'description'))
        }

    }

    const t1 = new Task(false, 'Complete Struct class', [])

    const t2 = copy(t1)

    it('callable', () => {
        expect(t1()).toBe(false)
        expect(t2()).toBe(false)
    })

    it('get state', () => {
        expect(t1[$$state]) 
            .toEqual({ complete: false, description: 'Complete Struct class'})
    })
    
    it('set state', () => {

        const t3 = new Task(false, 'Salt the plants', [1,2,3])

        t3[$$state] = { complete: true, description: 'water the plants' }
        expect(t3[$$state]).toEqual({ complete: true, description: 'water the plants' })
    })

    it('apply state', () => {

        const t4 = Struct.applyState(t2, { complete: true })

        expect(t4()).toEqual(true)
        expect(t4[$$state]).toEqual({ complete: true, description: t2.description })
 
    })

    it('equalable', () => {
        expect(equals(t2, t1)).toBe(true)
    })

    it('copyable', () => {
        expect(t1).not.toBe(t2)
    })

})