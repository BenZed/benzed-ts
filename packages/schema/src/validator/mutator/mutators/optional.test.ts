import { Optional } from './optional'

import { it } from '@jest/globals'
import ContractValidator from '../../contract-validator'
import { isString, nil } from '@benzed/util'

import { testValidator, testValidationContract } from '../../../util.test'

//// Tests ////

const $string = ContractValidator.generic({
    isValid: isString
})

testValidator<unknown, string>(
    $string,
    { asserts: nil, error: true }
)

const $optString = new Optional($string)

testValidator<unknown, string | undefined>(
    $optString,
    { asserts: nil } 
)