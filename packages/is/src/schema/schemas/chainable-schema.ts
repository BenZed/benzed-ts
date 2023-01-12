import { CallableStruct } from '@benzed/immutable'
import { TypeGuard } from '@benzed/util'

import { Schema } from '../schema'
import { Schematic, AnySchematic } from '../schematic'
import { IsInstanceInput } from './is-type'

import { IsEnumInput, type Or } from './or'

/* eslint-disable 
    @typescript-eslint/no-var-requires
*/

//// Main ////
 
const ChainableSchemaFactory = CallableStruct

/**
 * @internal
 */
interface ChainableSchemaFactoryInterface {

    get string(): unknown
    get boolean(): unknown
    get number(): unknown

    get integer(): unknown
    get bigint(): unknown
    get nan(): unknown

    get null(): unknown
    get nil(): unknown
    get undefined(): unknown
    get defined(): unknown

    get symbol(): unknown

    get primitive(): unknown
    get record(): unknown

    get iterable(): unknown
    get array(): unknown
    get map(): unknown
    get set(): unknown

    get object(): unknown
    get function(): unknown
    
    get promise(): unknown
    get error(): unknown
    get date(): unknown
    get weakMap(): unknown
    get weakSet(): unknown

    // get json(): unknown 

    tuple<T extends IsTupleInput>(
        ...types: T
    ): unknown

    shape<T extends IsShapeInput>(
        shape: T
    ): unknown

    enum<E extends IsEnumInput>(
        ...options: E
    ): unknown

    typeOf<T extends TypeGuard<unknown>>(is: T): unknown

    instanceOf<T extends IsInstanceInput>(
        type: T
    ): unknown

}

/**
 * @internal
 */
interface ChainableSchemaInterface {

    get or(): Or<AnySchematic>
    // get and(): And<AnySchematic>

}

//// Helper ////

const getOr = (): typeof Or => require('./or').Or
// const getAnd = (): typeof And => require('./and').And

//// For Container Schemas that should not have the SchemaBuilder interface ////

abstract class ChainableSchematic<T> extends Schematic<T> implements ChainableSchemaInterface {

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
abstract class ChainableSchema<T> extends Schema<T> implements ChainableSchemaInterface {

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
    ChainableSchemaFactoryInterface,
    ChainableSchemaInterface
}
