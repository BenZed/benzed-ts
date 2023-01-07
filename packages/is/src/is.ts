import { Callable } from '@benzed/util'
import { IsBoolean, IsEnum, IsEnumInput, IsNumber, IsString } from './schema/schemas'

import { Schema, SchemaFrom } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main ////

class Is extends Callable<SchemaFrom> {

    constructor() {
        super(Schema.from)
    }

    string = new IsString()

    boolean = new IsBoolean()

    number = new IsNumber()

    enum<E extends IsEnumInput>(
        ...options: E
    ): IsEnum<E> {
        return new IsEnum(...options)
    }

}

//// Default ////

const is = new Is()

//// Exports ////

export default Is

export {
    Is,
    is
}