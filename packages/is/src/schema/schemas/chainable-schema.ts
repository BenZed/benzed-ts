import { Callable } from '@benzed/util'

import { Schema } from '../schema'
import Schematic, { AnySchematic } from '../schematic'
import { IsInstanceInput } from './is-type'

import { IsEnumInput, type Or } from './or'

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

    instanceOf<T extends IsInstanceInput>(
        type: T
    ): unknown
}

interface ChainableSchematicInterface {

    get or(): Or<AnySchematic>

}

//// Helper ////

const getOr = (): typeof Or => require('./or').Or
// const getAnd = (): typeof And => require('./and').And

//// For Container Schemas that should not have the SchemaBuilder interface ////

abstract class ChainableSchematic<T> extends Schematic<T> implements ChainableSchematicInterface {

    get or(): Or<this> {
        const Or = getOr()
        return new Or(this)
    }

    // get and(): And<this> {
    //     const And = getAnd()
    //     return new And(this)
    // }

}

/**
 * Schema for chaining schemas into unions or intersections, as well as
 * nesting flag schemas
 */
abstract class ChainableSchema<T> extends Schema<T> implements ChainableSchematicInterface {

    get or(): Or<this> {
        const Or = getOr()
        return new Or(this)
    }

    // get and(): And<this> {
    //     const And = getAnd()
    //     return new And(this)
    // }

}

//// Exports ////

export default ChainableSchema

export {
    ChainableSchema,
    ChainableSchematic,
    ChainableSchemaFactory,
    ChainableSchemaFactoryInterface
}