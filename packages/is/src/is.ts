import { Callable } from '@benzed/util'
import { BooleanSchema, EnumSchema, EnumSchemaInput, NumberSchema, StringSchema } from './schemas'

import { Schema, SchemaFrom } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main ////

class Is extends Callable<SchemaFrom> {

    constructor() {
        super(Schema.from)
    }

    string = new StringSchema()

    boolean = new BooleanSchema()

    number = new NumberSchema()

    enum<E extends EnumSchemaInput>(
        ...options: E
    ): EnumSchema<E> {
        return new EnumSchema(...options)
    }

}

//// Exports ////

export default Is

export {
    Is
}