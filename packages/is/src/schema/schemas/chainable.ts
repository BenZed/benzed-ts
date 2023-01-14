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

interface ChainableJsonFactory {

    get string(): AnySchematic
    get boolean(): AnySchematic
    get number(): AnySchematic
    get integer(): AnySchematic

    get null(): AnySchematic
    get nil(): AnySchematic

    get record(): AnySchematic
    get array(): AnySchematic

}

/**
 * @internal
 */
interface ChainableFactory extends ChainableJsonFactory {

    get bigint(): AnySchematic
    get symbol(): AnySchematic
    get defined(): AnySchematic
    get primitive(): AnySchematic

    get nan(): AnySchematic
    get undefined(): AnySchematic

    get iterable(): AnySchematic
    get map(): AnySchematic
    get set(): AnySchematic

    get object(): AnySchematic
    get function(): AnySchematic
    
    get promise(): AnySchematic
    get error(): AnySchematic
    get date(): AnySchematic
    get weakMap(): AnySchematic
    get weakSet(): AnySchematic

    tuple<T extends IsTupleInput>(...types: T): IsTuple
    shape<T extends IsShapeInput>(shape: T): IsShape<T>
    instanceOf<T extends IsInstanceInput>(type: T): IsInstance<T>
    typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): IsType<T>

}

/**
 * @internal
 */
interface Chainable {

    get or(): Or<AnySchematic>
    // get and(): And<AnySchematic>
    // get optional(): Optional<AnySchematic>
    // get readonly(): Readonly<AnySchematic>

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

// const toOf = <T extends AnySchematic>(schematic: T): Of<T> => {
//     const { Of } = require('./of') as typeof import('./of')
//     return new Of(schematic)
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

abstract class ChainableSchematic<T> extends Schematic<T> implements Chainable {

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
abstract class ChainableSchema<T> extends Schema<T> implements Chainable {

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
    ChainableFactory,
    Chainable
}
