
import { isString } from '@benzed/util'

import { describe } from '@jest/globals'

import { Transformer } from './transformer'
import { ContractValidator } from '../contract-validator'
import ValidationContext from '../../validation-context'

import { testValidator, testValidationContract } from '../../util.test'

//// Tests ////

const string = new class String extends ContractValidator<unknown, string> {

    readonly name = 'String'

    override isValid(value: unknown, ctx: ValidationContext<unknown>): value is string {
        return isString(value) && super.isValid(value, ctx)
    }

    override transform(input: unknown): unknown {
        if (!isString(input))
            return input
            
        return this.lower ? input.toLowerCase() : this.trim ? input.trim() : input
    }

    error(): string {
        return `Must be a ${this.lower ? 'lower-case' : ''} ` + 
            `${this.trim ? 'trimmed' : ''}`
    }

    readonly lower = false

    readonly trim = false

}

const id = ContractValidator.generic<string, `#id-${number}`>({

    name: 'Id',

    transform(input) {
        const numbers = input.split('').filter(i => /\d/.test(i)).join('')
        return `#id-${numbers}`
    }
    
})

const $id = new Transformer(string).to(id)

//// Setup ////

describe(`${$id.name} validator tests`, () => {
    
    testValidator(
        $id,
        { transforms: '0000', output: '#id-0000' },
        { asserts: '#id-0000' },
    )
})

describe(`${$id.name} validator contract tests`, () => {

    testValidationContract(
        $id,
        {
            validInput: '#id-0',
            invalidInput: '0',
            transforms: { invalidInput: '100', validOutput: '#id-100' },
        }
    )

})
