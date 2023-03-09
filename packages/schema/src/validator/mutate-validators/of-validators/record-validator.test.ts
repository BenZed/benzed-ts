import { isNumber, isString } from '@benzed/util'

import { RecordValidator } from './record-validator'

import { testValidator } from '../../../util.test'
import { TypeValidator, ContractValidator } from '../../validators'

import Schema from '../../schema/schema'

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

    message() {
        return 'key must start with "set"'
    }
}

class Number extends TypeValidator<number> {

    isValid(value: unknown): value is number {
        return isNumber(value)
    }

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

// const $keyRecord = new RecordValidator(new SetStringKey, new Number)
describe(RecordValidator.name + ' validation tests', () => {

    const $record = new RecordValidator(new Number)

    testValidator<unknown, Record<string, number>>(
        $record,
        { asserts: {} },
        { asserts: { one: 1, two: 2 } },
        { transforms: { one: 1, two: 2 } },
        { transforms: { one: 1, two: 2, three: 3 } },
        { asserts: new Date(), error: true }
    )

})

describe(RecordValidator.name + ' key validation tests', () => {

    const $fancyRecord = new RecordValidator(
        new SetStringKey,
        new Number
    )

    testValidator<unknown, Record<`set${string}`, number>>(
        $fancyRecord,
        { asserts: { 'setOne': 1 } },
        { asserts: { 'one': 1 }, error: 'key must start with "set"' },
    )

})

describe('Retains value interface', () => {

    const $schemaRecord = new RecordValidator(new NumberSchema)

    testValidator<unknown, Record<string, number>>(
        $schemaRecord,
        { asserts: { 'one': 1 } }
    )

    testValidator<unknown, Record<string, number>>(
        $schemaRecord.named('Numeric'),
        { asserts: { 'one': 'ace' }, error: true }
    )

})

