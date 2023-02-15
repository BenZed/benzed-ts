import { isBoolean, isNumber, isString, pick } from '@benzed/util'
import { $$state } from '@benzed/immutable'

import { UnionValidator } from './union-validator'
import TypeValidator from './type-validator'

import { ValidatorStruct } from '../validator-struct'
import { ValidateSettings } from '../validate-struct'

import { testValidator } from '../../util.test'

import { describe } from '@jest/globals'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Tests ////

class Number extends TypeValidator<number> {
    readonly isValid = isNumber
    readonly name = 'Number'
}

class Boolean extends TypeValidator<boolean> {
    readonly isValid = isBoolean
    readonly name = 'Boolean'
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

    class String extends TypeValidator<string> {

        isValid(value: unknown): value is string {
            return isString(value) && (this.allowEmpty || value.length > 0)
        }
        readonly name = 'String'

        readonly allowEmpty = true

        notEmpty(): this {
            return ValidatorStruct.applySettings(this, { allowEmpty: false } as ValidateSettings<this>)
        }

        get [$$state](): { allowEmpty: boolean, name: string } {
            return pick(this, 'allowEmpty', 'name')
        }
    }

    const $numOrBOrS = new UnionValidator(new Number, new Boolean, new String)

    it('allowEmpty', () => {
        expect($numOrBOrS.allowEmpty).toBe(true)
    })

    describe('notEmpty()', () => {
        const $numOrBOrFullS = $numOrBOrS.notEmpty()

        testValidator<unknown, string | boolean | number>(
            $numOrBOrFullS, 
            { asserts: 'ace' },
            { asserts: '', error: true },
            { asserts: true },
            { asserts: 10 },
            { asserts: Symbol(), error: true }
        )

        it('updates', () => {
            expect($numOrBOrFullS.allowEmpty).toBe(false)
        }) 
    })
})