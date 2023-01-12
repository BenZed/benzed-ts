import { CallableStruct } from '@benzed/immutable'
import { TypeGuard } from '@benzed/util'

import { Schema } from '../schema'
import { Schematic, AnySchematic } from '../schematic'
import { IsInstanceInput } from './is-type'

import { type Or } from './or'

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

const toOr = <T extends AnySchematic>(schematic: T): Or<T> => {
    const _Or = require('./or').Or as typeof Or 
    return new _Or(schematic)
}

// const toAnd = <T extends AnySchematic>(schematic: T): And<T> => {
//     const _And = require('./and').Or as typeof And 
//     return new _And(schematic)
// }

// const toOptional = <T extends AnySchematic>(schematic: T): Optional<T> => {
//     const _Optional = require('./optional').Optional as typeof And 
//     return new _Optional(schematic)
// }

// const toReadOnly = <T extends AnySchematic>(schematic: T): ReadOnly<T> => {
//     const _ReadOnly = require('./readonly').ReadOnly as typeof ReadOnly 
//     return new _ReadOnly(schematic)
// }

//// For Container Schemas that should not have the SchemaBuilder interface ////

abstract class ChainableSchematic<T> extends Schematic<T> implements ChainableSchemaInterface {

    get or(): Or<this> {
        return toOr(this)
    }

    // get and(): And<this> {
    //     return toAnd(this)
    // }

    // get optional(): And<this> {
    //     return toAnd(this)
    // }

    // get readonly(): And<this> {
    //     return toAnd(this)
    // }

}

/**
 * Schema for chaining schemas into unions or intersections, as well as
 * nesting flag schemas
 */
abstract class ChainableSchema<T> extends Schema<T> implements ChainableSchemaInterface {

    get or(): Or<this> {
        return toOr(this)
    }

    // get and(): And<this> {
    //     return toAnd(this)
    // }

    // get optional(): And<this> {
    //     return toAnd(this)
    // }

    // get readonly(): And<this> {
    //     return toAnd(this)
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
