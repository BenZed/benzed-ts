import { assign, define, isBoolean, isNumber, isString, pick } from '@benzed/util'
import { StructStateApply, Structural } from '@benzed/immutable'
import { Trait } from '@benzed/traits'

import { UnionValidator } from './union-validator'
import { testValidator } from '../../util.test'
import { TypeValidator } from './contract-validators'

import { ValidateImmutable, ValidateStructural } from '../../traits'

import { describe, it, expect } from '@jest/globals' 

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/ 

//// Tests ////

class Number extends Trait.add(TypeValidator<number>, ValidateImmutable) {

    isValid(input: unknown): input is number {
        return isNumber(input) 
    }

    override readonly name = 'Number'
}

class Boolean extends Trait.add(TypeValidator<boolean>, ValidateImmutable) {

    isValid(input: unknown): input is boolean {
        return isBoolean(input)
    }

    override readonly name = 'Boolean' 
}

//// Setup //// 

const $numberOrBool = new UnionValidator(new Number, new Boolean)

describe(`${$numberOrBool.name} validator tests`, () => {

    testValidator<unknown, number | boolean>(
        $numberOrBool,
        { asserts: 'ace', error: true },
        { asserts: 1 },
        { asserts: 0 },
        { asserts: true },
        { asserts: false },
    )

})

describe('retains interface of most recently added validator', () => {

    class String extends Trait.add(TypeValidator<string>, ValidateStructural) {

        isValid(value: unknown): value is string {
            return isString(value) && (this.allowEmpty || value.length > 0)
        }
        override readonly name = 'String'

        readonly allowEmpty: boolean = true

        notEmpty(): this {
            return Structural.create(this, { allowEmpty: false } as StructStateApply<this>)
        }

        get [Structural.state](): { allowEmpty: boolean, name: string } {
            return pick(this, 'allowEmpty', 'name')
        }

        set [Structural.state]({ allowEmpty, name }: { allowEmpty: boolean, name: string }) {
            assign(this, { allowEmpty })
            define.named(name, this)
        }
    }

    const $numOrBoolOrString = new UnionValidator(new Number, new Boolean, new String)

    it('allowEmpty', () => {
        expect($numOrBoolOrString.allowEmpty).toBe(true)
    })

    describe('notEmpty()', () => {

        const $numOrBoolOrNonEmptyString = $numOrBoolOrString.notEmpty()

        testValidator<unknown, string | boolean | number>(
            $numOrBoolOrNonEmptyString,
            { asserts: 'ace' },
            { asserts: '', error: true },
            { asserts: true },
            { asserts: 10 },
            { asserts: Symbol(), error: true }
        )

        it('updates', () => {
            expect($numOrBoolOrNonEmptyString.allowEmpty).toBe(false)
        })
    })
})