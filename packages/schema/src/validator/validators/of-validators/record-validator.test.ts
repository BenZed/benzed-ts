import { assign, define, isNumber, isString, pick } from '@benzed/util'

import { RecordValidator } from './record-validator'

import { testValidator } from '../../../util.test'
import ContractValidator from '../contract-validator'
import { TypeValidator } from '../contract-validators'
import Schema from '../../schema/schema'
import { Structural } from '@benzed/immutable'
import { Trait } from '@benzed/traits'
import { ValidateImmutable } from '../../../traits'

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

    message = 'key must start with "set"'
}

class Number extends Trait.add(TypeValidator<number>, ValidateImmutable) {

    readonly name = 'Number'

    isValid(value: unknown): value is number {
        return isNumber(value)
    }

    get [Structural.state](): Pick<this, 'name'> {
        return pick(this, 'name')
    }

    set [Structural.state](state: Pick<this, 'name'>) {
        define.named(state.name, this)
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

    testValidator<object, Record<string, number>>(
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

    testValidator<object, Record<`set${string}`, number>>(
        $fancyRecord,
        { asserts: { 'setOne': 1 } },
        { asserts: { 'one': 1 }, error: 'key must start with "set"' },
    )

})

describe('Retains value interface', () => {

    const $schemaRecord = new RecordValidator(new NumberSchema)

    testValidator<object, Record<string, number>>(
        $schemaRecord,
        { asserts: { 'one': 1 } }
    )

    testValidator<object, Record<string, number>>(
        $schemaRecord.named('Numeric'),
        { asserts: { 'one': 'ace' }, error: true }
    )

})
