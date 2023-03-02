import { define, isBoolean, isNumber, isString, pick } from '@benzed/util'

import { UnionValidator } from './union-validator'
import { testValidator } from '../../util.test'
import { TypeValidator } from './contract-validators'

import { describe, it, expect } from '@jest/globals' 
import { Validator, ValidatorStateApply } from '../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/ 

//// Tests ////

class Number extends TypeValidator<number> {

    isValid(input: unknown): input is number {
        return isNumber(input) 
    }

}

class Boolean extends TypeValidator<boolean> {

    isValid(input: unknown): input is boolean {
        return isBoolean(input)
    }

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

        readonly allowEmpty: boolean = true 

        notEmpty(): this {
            return Validator.applyState(this, { allowEmpty: false } as ValidatorStateApply<this>)
        }

        get [Validator.state](): Pick<this, 'allowEmpty' | 'name' | 'message'> {
            return pick(this, 'allowEmpty', 'name', 'message')
        }

        set [Validator.state](state: Pick<this, 'allowEmpty' | 'name' | 'message'>) {
            define.named(state.name, this)
            define.hidden(this, 'message', state.message)
            define.enumerable(this, 'allowEmpty', state.allowEmpty)
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