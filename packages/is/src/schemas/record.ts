
import {
    RecordValidator,
    PropertyKeyValidator,

    Validator,
    NameSchema,
    SchemaBuilder
} from '@benzed/schema'

import { nil } from '@benzed/util'

import { Unknown } from './types'

//// Sup ////

//// EsLint ////
/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Intro ////

class RecordOf<K extends PropertyKeyValidator, V extends Validator> extends NameSchema<RecordValidator<K, V>, {}> {

    constructor(value: V)
    constructor(key: K, value: V)
    constructor(...args: [K, V] | [V]) {
        super(
            new (RecordValidator as any)(...args),
            {}
        )
    }

    get key(): K | nil {
        return this[SchemaBuilder.main].key
    }

}

//// Exports ////

export default RecordOf

export type Record = RecordOf<PropertyKeyValidator, Unknown>

export const $record = new RecordOf(new Unknown)