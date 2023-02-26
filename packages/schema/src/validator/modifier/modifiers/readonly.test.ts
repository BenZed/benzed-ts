import { isArrayOf, isNumber, isInteger, pick, assign } from '@benzed/util'
import { StructState, Structural } from '@benzed/immutable'
import { Trait } from '@benzed/traits'

import { ReadOnly } from './readonly'
import { expectTypeOf } from 'expect-type'

import { TypeValidator } from '../../validators'
import Modifier from '../modifier'

//// Tests ////

class Buffer extends Trait.add(TypeValidator<number[]>, Structural) {

    isValid(input: unknown): input is number[] {
        return isArrayOf(isNumber)(input) && 
            input.every(isInteger) &&
            input.every(v => v >= 0 && v < 256) && 
            input.length > this.minSize
    }

    readonly minSize = 0

    readonly enabled = true
    
    toggleEnabled(): this {
        return Structural.apply( 
            this, 
            { enabled: !this.enabled } as StructState<this>
        )
    }

    get [Structural.key](): { minSize: number, enabled: boolean} {
        return pick(this, 'minSize', 'enabled')
    }

    set [Structural.key](state: { minSize: number, enabled: boolean} ) {
        assign(this, state)
    }
}

//// Tests ////

const $buffer = new Buffer()

const $readOnlyBuffer = new ReadOnly($buffer)

//// Tests ////

describe('ReadOnly type mutation', () => {

    it('wrap type', () => {
        expectTypeOf($readOnlyBuffer)
            .toEqualTypeOf<ReadOnly<Buffer>>()
    })

    it('output type', () => {
        expectTypeOf<ReturnType<typeof $readOnlyBuffer>>()
            .toEqualTypeOf<readonly number[]>()
    })

})

describe('removable', () => {

    it('output type', () => {

        const $buffer2 = $readOnlyBuffer.writable

        expectTypeOf<ReturnType<typeof $buffer2>>()
            .toEqualTypeOf<number[]>()
    })
})

describe('effect on target', () => { 

    it('cannot be stacked', () => {
        expect(() => new ReadOnly(new ReadOnly($buffer))).toThrow('already has modifier')
    })

    it('has target properties', () => {
        expect($readOnlyBuffer.minSize).toBe($buffer.minSize)
    })
  
    it('favours own properties', () => {
        expect($readOnlyBuffer.writable).toEqual($buffer)
        expect($readOnlyBuffer.writable).toBeInstanceOf(Buffer)
    })

    it('wraps result instances in self', () => {

        const $disabledBuffer = $buffer.toggleEnabled()
        expect($disabledBuffer).toBeInstanceOf(Buffer)
        expect($disabledBuffer.enabled).toEqual(false)

        const $disabledReadOnlyBuffer = $readOnlyBuffer.toggleEnabled()

        expect($disabledReadOnlyBuffer.enabled).toEqual(false)
        expect($disabledReadOnlyBuffer).toBeInstanceOf(ReadOnly)

        expectTypeOf($disabledReadOnlyBuffer)
            .toEqualTypeOf<ReadOnly<Buffer>>()
    })

    it('result instances retain mutator properties', () => {  
 
        expect($readOnlyBuffer[Modifier.target]).toEqual($buffer)

        const $disabledReadOnlyBuffer = $readOnlyBuffer.toggleEnabled()

        expect($disabledReadOnlyBuffer.writable).toBeInstanceOf(Buffer)
        expect($disabledReadOnlyBuffer[Modifier.target]).toBeInstanceOf(Buffer)

    })

})
