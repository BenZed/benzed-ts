import { isString } from '@benzed/util'
import { it } from '@jest/globals'

import { TransformValidator } from './transform-validator'
import { ContractValidator } from '../contract-validator'
import { TypeValidator } from './type-validator'

import { testValidator } from '../../util.test'
import { ValidatorStruct } from '..'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/ban-types
*/
//// Setup ////

class String extends TypeValidator<string> {
    readonly name = 'String'
    readonly isValid = isString
}

class Id extends ContractValidator<string, `#-${number}`> {
    readonly name = 'Id'
    isValid(value: string): boolean {
        return /#-\d+/.test(value)
    }
}

const $id = new TransformValidator(new String).to(new Id)

//// Tests ////

describe(`${$id.name} validator tests`, () => {

    testValidator<unknown, `#-${number}`>( 
        $id,
        { asserts: '#-00001' }, 
        { asserts: '1', error: true }, 
    )

})

describe('to()', () => {

    it('can only transition to validators that extend output', () => {
        // @ts-expect-error number is invalid
        void $id.to(new class extends ContractValidator<number, number> {})
    })

})