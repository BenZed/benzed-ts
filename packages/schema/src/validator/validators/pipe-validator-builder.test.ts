import { PipeValidatorBuilder } from './pipe-validator-builder'

import { describe } from '@jest/globals'
import TypeValidator from './type-validator'
import { isBoolean, isNumber, isUnion, fail, pass } from '@benzed/util'

import { testValidator, testValidationContract } from '../../util.test'

//// Tests ////

const $option = new class extends TypeValidator<boolean | number> {
    name = 'NumberOrBoolean'
    isValid = isUnion(isBoolean, isNumber)
}

const $optionBuilder = new PipeValidatorBuilder($option)

describe('validates', () => {

    const $optionBuilderX3 = $optionBuilder.validates({
        isValid: value => isBoolean(value) || value % 3 === 0,
        message: 'Must be divisible by three.'
    })

    describe(`${$optionBuilderX3.name} validator contract tests`, () => {

        testValidationContract<unknown, number | boolean>(
            $optionBuilderX3,
            {
                validInput: 6,
                invalidInput: '6'
            }
        )

        testValidator<unknown, number | boolean>(
            $optionBuilderX3,
            { transforms: 3 },
            { asserts: 4, error: 'ust be divisible by three' },
            { asserts: 4.5, error: 'ust be divisible by three' },
            { asserts: true },
            { asserts: false },
        )

    })

})

describe('asserts', () => {

    const $optionBuilderFalsy = $optionBuilder.asserts(
        v => isNumber(v) ? v <= 0 : !v,
        'Must be falsy'
    )

    testValidationContract<unknown, number | boolean>(
        $optionBuilderFalsy,
        {
            validInput: -1,
            invalidInput: true
        }
    )
    
    testValidator<unknown, number | boolean>(
        $optionBuilderFalsy,
        { transforms: -1 },
        { transforms: 0 },
        { transforms: false },
        { transforms: true, error: true },
        { transforms: 1, error: true },
    )

})

describe('transforms', () => {

    const $optionBuilderMin = $optionBuilder.transforms(
        v => isNumber(v) ? Math.max(v, 0) : v,
        'Must be above 0'
    )

    testValidationContract<unknown, number | boolean>(
        $optionBuilderMin,
        {
            validInput: 1,
            invalidInput: -1,
            transforms: { invalidInput: -1, validOutput: 0 }
        }
    )

    testValidator<unknown, number | boolean>(
        $optionBuilderMin,
        { asserts: 0 },
        { asserts: -1, error: true },
        { transforms: -1, output: 0 },
        { transforms: false },
        { transforms: true },
    )

})

describe('id', () => {

    const $$customId = Symbol('fix')
    
    const $broken = $optionBuilder.asserts(
        fail,
        $$customId
    )
    
    describe('id to update', () => {
 
        testValidator<unknown, boolean | number>(
            $broken,
            { transforms: 0, error: true },
        )
    
        const $fixed = $broken.asserts(pass, $$customId)
        testValidator<unknown, boolean | number>(
            $fixed,
            { transforms: 0, error: false },
            { asserts: 0, error: false },
        )
    
    })

    describe('id to remove', () => {
        
        const $fixed2 = $broken.remove($$customId)

        testValidator<unknown, boolean | number>(
            $fixed2,
            { transforms: 0, error: false },
        )
    
        test('throws if id not found', () => {
            expect(() => $optionBuilder.remove($$customId)).toThrow('could not be found')
        })

    })

})
