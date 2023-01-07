import { Callable } from '@benzed/util'

import { Schema } from '../schema'
import { IsEnumInput } from './is-type'

import { type Or } from './or'

/* eslint-disable 
    @typescript-eslint/no-var-requires
*/
//// Main ////

const ChainableSchemaFactory = Callable

interface ChainableSchemaFactoryInterface {

    get string(): unknown

    get boolean(): unknown

    get number(): unknown

    enum<E extends IsEnumInput>(
        ...options: E
    ): unknown

}

/**
 * Schema for chaining schemas into unions or intersections, as well as
 * nesting flag schemas
 */
abstract class ChainableSchema<T> extends Schema<T> {

    get or(): Or<this> {
        const _Or = require('./or').Or as typeof Or
        return new _Or(this)
    }

    // get and(): And<this> {}

}

//// Exports ////

export default ChainableSchema

export {
    ChainableSchema,
    ChainableSchemaFactory,
    ChainableSchemaFactoryInterface
}