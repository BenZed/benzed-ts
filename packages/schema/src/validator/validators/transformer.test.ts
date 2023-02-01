
import { isString } from '@benzed/util'

import { describe } from '@jest/globals'

import { Transformer } from './transformer'
import { ContractValidator } from '../contract-validator'
import ValidationContext from '../../validation-context'

import { testValidator } from '../../util.test'

//// Tests ////

describe(`${Transformer.name}`, () => {

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

        transform(input: string): `#id-${number}` {
            const numbers = input.split('').filter(i => /[0-9]/.test(i)).join('')
            return `#id-${parseInt(numbers)}`
        }
    
    })

    const $id = new Transformer(string).to(id)

    describe(`${$id.name} validator tests`, () => {
    
        testValidator(
            $id,
            { transforms: '0000', output: '#id-0000' },
        )
    })
})
