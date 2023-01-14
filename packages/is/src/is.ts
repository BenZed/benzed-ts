import { isFunc, TypeGuard } from '@benzed/util'

import {

    isString,
    isBoolean, 
    isNumber,
    isInteger,

    isBigInt,
    isSymbol,
    isPrimitive,

    isNull,
    isUndefined,
    isNaN,
    isNil,

    isFunction, 

    arrayOf,

    isIterable,
    isArray,

    isObject,
    isPromise,
    isError,
    isDate, 

    IsType, 
    ResolveSchematic, 
    Schematic,
} from './schema'
import { ChainableFactory, SchematicFactory } from './schema/schemas/chainable'

import { 
    TypeValidator, 
    TypeValidatorSettings
} from './validator'

//// Main ////

class Is extends SchematicFactory<ResolveSchematic> 
    implements ChainableFactory {

    constructor() {
        super(Schematic.resolve)
    }

    string = isString
    boolean = isBoolean
    number = isNumber
    integer = isInteger

    bigint = isBigInt
    symbol = isSymbol
    primitive = isPrimitive

    null = isNull
    undefined = isUndefined
    nan = isNaN
    nil = isNil

    iterable = isIterable
    // iterableOf = isIterableOf

    array = isArray
    arrayOf = arrayOf
    // map = isMap
    // mapOf = mapOf
    // set = isSet
    // setOf = setOf

    // record = isRecord
    // recordOf = recordOf

    object = isObject
    function = isFunction
    
    promise = isPromise
    error = isError

    date = isDate

    tuple<T extends IsTupleInput>(...types: T): IsTuple<T> {
        return new IsTuple(...types)
    }

    shape<T extends IsShapeInput>(shape: T): IsShape<T> {
        return new IsShape(shape)
    }

    instanceOf<T extends IsInstanceInput>(type: T): IsInstance<T> {
        return new IsInstance(type)
    }

    typeOf<T>(type: TypeGuard<T> | TypeValidatorSettings<T>): IsType<T> {

        if (type instanceof IsType)
            return type

        const settings = isFunc<TypeGuard<T>>(type)
            ? type instanceof TypeValidator<T>
                ? type
                : { 
                    is: type, 
                    type: type
                        .name
                        .replace(/^is/, '') || 'unknown' 
                }
            : type
        return new IsType(settings)
    }

}

//// Default ////

const is = new Is

//// Exports ////

export default Is

export {
    is,
    Is
}