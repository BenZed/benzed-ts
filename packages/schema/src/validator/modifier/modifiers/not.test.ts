import { StructState, Structural } from '@benzed/immutable'
import { Trait } from '@benzed/traits'
import { assign, pick } from '@benzed/util'

import {ContractValidator} from '../../validators'
import { Not } from './not'
import { testValidator } from '../../../util.test'
import { expectTypeOf } from 'expect-type'

//// Tests //// 

type id = `#id-${number}`

class Id extends Trait.add(ContractValidator<string, id>, Structural) {

    override name = 'Id'

    transform(input: string): `#id-${number}` {
        const digits = input.replace('#id-', '')

        let numeric = parseInt(digits)
        if (numeric < this.minId) 
            numeric = this.minId

        return `#id-${numeric}`
    }

    readonly minId = 0

    setMinId(to: number): this {
        return Structural.apply(
            this, 
            { minId: to } as StructState<this>
        )
    }

    message = function (): string {
        return `Must be ${this.name}`
    }

    get [Structural.state](): Pick<this, 'minId'> {
        return pick(this, 'minId')
    }

    set [Structural.state](state: Pick<this, 'minId'>) {
        assign(this, state)
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
        { asserts: '2', error: 'Must be Id' },
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

describe('removable', () => {

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
