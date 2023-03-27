import { pick } from '@benzed/util'

import {ContractValidator} from '../../validators'
import { Not } from './not'
import { testValidator } from '../../../util.test'
import { expectTypeOf } from 'expect-type'
import { Validator, ValidatorState } from '../../validator'

import { describe, it, expect } from '@jest/globals'

//// Tests //// 

type id = `#id-${number}`

class Id extends ContractValidator<string, id> {

    override transform(input: string): `#id-${number}` {
        const digits = input.replace('#id-', '')

        let numeric = parseInt(digits)
        if (numeric < this.minId) 
            numeric = this.minId

        return `#id-${numeric}`
    }

    readonly minId = 0

    setMinId(to: number): this {
        return Validator.applyState(
            this, 
            { minId: to } as ValidatorState<this>
        )
    }

    override message(): string {
        return `must be ${this.name}`
    }

    get [Validator.state](): Pick<this, 'minId' | 'message' | 'name'> {
        return pick(this, 'minId', 'message', 'name')
    }

}

//// Tests ////

const $id = new Id()

const $notId = new Not($id)

//// Tests ////

describe('Not validation mutation', () => {

    testValidator(
        $id,
        { transforms: '1', output: '#id-1' },
        { asserts: '#id-2', output: '#id-2' },
        { asserts: '2', error: 'must be Id' },
    )

    testValidator(
        $notId,
        { transforms: '1', output: '1' },
        { asserts: '#id-2', error: true },
        { asserts: '2' },
    )

    it('wrap type', () => {
        expectTypeOf($notId)
            .toEqualTypeOf<Not<Id>>()
    })

    it('output type', () => {
        expectTypeOf<ReturnType<typeof $notId>>()
            .toEqualTypeOf<string>()
    })

})

describe.skip('removable', () => {

    it('output type', () => {
        const $id2 = $notId.not

        expectTypeOf<ReturnType<typeof $id2>>()
            .toEqualTypeOf<id>()
    })
})

describe('effect on target', () => {

    it('cannot be stacked', () => {
        expect(() => new Not(new Not($id))).toThrow('already has modifier')
    })

    it('has target properties', () => { 
        expect($notId.minId).toBe($id.minId)
    })

    it('wraps result instances in self', () => { 

        const $min100Id = $id.setMinId(100)
        expect($min100Id).toBeInstanceOf(Id)

        const $notMin100Id = $notId.setMinId(100)

        expect($notMin100Id.minId).toEqual(100)
        expect($notMin100Id).toBeInstanceOf(Not)

        expectTypeOf($notMin100Id)
            .toEqualTypeOf<Not<Id>>()
    })

})
