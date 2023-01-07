import { Callable } from '@benzed/util'
import { IsBoolean, IsEnum, IsEnumInput, IsNumber, IsString } from './schemas'

import { Schema, SchemaFrom } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Type ////

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

//// Exports ////

export default Is

export {
    Is
}