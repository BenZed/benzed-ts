import { isArray, isNumber, isInteger } from '@benzed/util'

import { ReadOnly } from './readonly'

import { $$target, MutatorType } from '../mutator'

import { expectTypeOf } from 'expect-type'
import { StructState } from '@benzed/immutable'
import { SubValidator, TypeValidator } from '../../validators'
import { addMutator } from '../mutator-operations'

//// Tests ////

class Buffer extends TypeValidator<number[]> implements SubValidator<number[]> {

    isValid(input: unknown): input is number[] {
        return isArray(input, isNumber) && 
            input.every(isInteger) &&
            input.every(v => v >= 0 && v < 256) && 
            input.length > this.minSize
    }

    readonly minSize = 0

    readonly enabled = true
    
    toggleEnabled(): this {
        return TypeValidator.applyState( 
            this, 
            { enabled: !this.enabled } as unknown as StructState<this>
        )
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
        const $stacked = new ReadOnly(new ReadOnly($buffer))
        expect($stacked[$$target]).toBe($buffer)
        expectTypeOf($stacked).toMatchTypeOf<ReadOnly<Buffer>>()
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
        const $disabledReadOnlyBuffer = $readOnlyBuffer.toggleEnabled()

        expect($disabledReadOnlyBuffer.enabled).toEqual(false)
        expect($disabledReadOnlyBuffer).toBeInstanceOf(ReadOnly)

        expectTypeOf($disabledReadOnlyBuffer)
            .toEqualTypeOf<ReadOnly<Buffer>>()
    })

    it('result instances retain mutator properties', () => {  
 
        expect($readOnlyBuffer[$$target]).toEqual($buffer)

        const $disabledReadOnlyBuffer = $readOnlyBuffer.toggleEnabled()

        expect($disabledReadOnlyBuffer.writable).toBeInstanceOf(Buffer)
        expect($disabledReadOnlyBuffer[$$target]).toBeInstanceOf(Buffer)

    })

})
