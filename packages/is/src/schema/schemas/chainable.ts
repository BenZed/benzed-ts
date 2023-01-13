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
 
const ChainableSchematicFactory = CallableStruct

/**
 * @internal
 */
interface ChainableSchematicFactoryInterface {

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

    // tuple<T extends IsTupleInput>(
    //     ...types: T
    // ): unknown

    // shape<T extends IsShapeInput>(
    //     shape: T
    // ): unknown

    typeOf<T extends TypeGuard<unknown>>(is: T): unknown

    instanceOf<T extends IsInstanceInput>(
        type: T
    ): unknown

}

/**
 * @internal
 */
interface ChainableSchematicInterface {

    get or(): Or<AnySchematic>
    // get and(): And<AnySchematic>

}

//// Helper ////

const toOr = <T extends AnySchematic>(schematic: T): Or<T> => {
    const { Or } = require('./or') as typeof import('./or')
    return new Or(schematic)
}

// const toAnd = <T extends AnySchematic>(schematic: T): And<T> => {
//     const { And } = require('./and') as typeof import('./and')
//     return new And(schematic)
// }

// const toOptional = <T extends AnySchematic>(schematic: T): Optional<T> => {
//     const { Optional } = require('./optional') as typeof import('./optional')
//     return new Optional(schematic)
// }

// const toReadOnly = <T extends AnySchematic>(schematic: T): ReadOnly<T> => {
//     const { ReadOnly } = require('./readonly') as typeof import('./readonly')
//     return new ReadOnly(schematic)
// }

//// For Container Schemas that should not have the SchemaBuilder interface ////

abstract class ChainableSchematic<T> extends Schematic<T> implements ChainableSchematicInterface {

    get or(): Or<this> {
        return toOr(this)
    }

    // get and(): And<this> {
    //     return toAnd(this)
    // }

    // get optional(): Optional<this> {
    //     return toOptional(this)
    // }

    // get readonly(): Readonly<this> {
    //     return toReadonly(this)
    // }

}

/**
 * Schema for chaining schemas into unions or intersections, as well as
 * nesting flag schemas
 */
abstract class ChainableSchema<T> extends Schema<T> implements ChainableSchematicInterface {

    get or(): Or<this> {
        return toOr(this)
    }

    // get and(): And<this> {
    //     return toAnd(this)
    // }

    // get optional(): Optional<this> {
    //     return toOptional(this)
    // }

    // get readonly(): Readonly<this> {
    //     return toReadonly(this)
    // }

}

//// Exports ////

export default ChainableSchema

export {
    ChainableSchema,
    ChainableSchematic,
    ChainableSchematicFactory,
    ChainableSchematicFactoryInterface,
    ChainableSchematicInterface
}
