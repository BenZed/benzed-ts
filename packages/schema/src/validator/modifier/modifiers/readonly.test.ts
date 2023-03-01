import { isArrayOf, isNumber, isInteger, pick, define } from '@benzed/util'
import { Stateful, StructState, Structural } from '@benzed/immutable'

import { ReadOnly } from './readonly'
import { expectTypeOf } from 'expect-type'

import { TypeValidator } from '../../validators'
import Modifier from '../modifier'
import { Validator } from '../../validator'

//// Tests ////

class Buffer extends TypeValidator<number[]> {

    isValid(input: unknown): input is number[] {
        return isArrayOf(isNumber)(input) && 
            input.every(isInteger) &&
            input.every(v => v >= 0 && v < 256) && 
            input.length > this.minSize
    }

    readonly minSize = 0

    readonly enabled = true
    
    toggleEnabled(): this {
        return Structural.create( 
            this, 
            { enabled: !this.enabled } as StructState<this>
        ) 
    }

    get [Validator.state](): Pick<this, 'minSize' | 'enabled' | 'name' | 'message'> {
        return pick(this, 'minSize', 'enabled', 'name', 'message')
    }

    set [Validator.state](state: Pick<this, 'minSize' | 'enabled' | 'name' | 'message'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.enumerable(this, 'enabled', state.enabled)
        define.enumerable(this, 'minSize', state.minSize) 
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
