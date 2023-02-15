import { isNumber, isString } from '@benzed/util'

import { it } from '@jest/globals'

import ContractValidator from '../../contract-validator'
import TypeValidator from '../type-validator'
import { RecordValidator } from './record-validator'
import { Schema } from '../schema'

import { testValidator, testValidationContract } from '../../../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Setup ////

type Key = string | symbol | number

class KeyValidator<K extends Key> extends ContractValidator<Key,K> {

}

class SetStringKey extends KeyValidator<`set${string}`> {

    isValid(value: Key): boolean {
        return isString(value) && value.startsWith('set')
    }

    message(): string {
        return 'Key must start with "set"'
    }

}

class Number extends TypeValidator<number> {
    readonly name = 'Number'
    readonly isValid = isNumber
}

class NumberSchema extends Schema<Number, {}> {

    constructor() {
        super(new Number, {})
    }

    named(name: string): this {
        return this._applyMainValidator({
            name
        } as any)
    }

}

//// Tests ////

it.todo(RecordValidator.name)

// const $keyRecord = new RecordValidator(new SetStringKey, new Number)
describe(RecordValidator.name + 'validation tests', () => {

    const $record = new RecordValidator(new Number)

    testValidator<object, Record<string,number>>(
        $record,
        { asserts: {} },
        { asserts: { one: 1, two: 2 } },
        { transforms: { one: 1, two: 2 } },
        { transforms: { one: 1, two: 2, three: 3 } },
        { asserts: new Date(), error: true }
    )

    testValidationContract<object, Record<string,number>>(
        $record,
        {
            validInput: { one: 1 },
            invalidInput: { one: '2' }
        }
    )
    
})

describe(RecordValidator.name + ' key validation tests', () => {

    const $fancyRecord = new RecordValidator(new SetStringKey, new Number)

    testValidator<object, Record<`set${string}`, number>>(
        $fancyRecord,
        { asserts: { 'setOne': 1 } },
        { asserts: { 'one': 1 }, error: 'Key must start with "set"' },
    )

})

describe('Retains value interface', () => {

    const $schemaRecord = new RecordValidator(new NumberSchema)

    testValidator<object, Record<string, number>>(
        $schemaRecord,
        { asserts: { 'one': 1 } },
    )

    testValidator<object, Record<string, number>>(
        $schemaRecord.named('Numeric'),
        { asserts: { 'one': 'ace' }, error: 'Numeric' },
    )

})

