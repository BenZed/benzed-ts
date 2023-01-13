import { isFunc, TypeGuard } from '@benzed/util'

import { IsType, ResolveSchematic, Schematic } from './schema'
import * as chain from './schema/schemas/chain'

import { 
    TypeValidator, 
    TypeValidatorSettings
} from './validator'

//// Main ////

class Is extends chain.ChainableSchematicFactory<ResolveSchematic> 
    implements chain.ChainableFactory {

    constructor() {
        super(Schematic.resolve)
    }

    string = chain.isString
    boolean = chain.isBoolean
    number = chain.isNumber
    integer = chain.isInteger
    bigint = chain.isBigInt
    nan = chain.isNaN
    null = chain.isNull
    nil = chain.isNil
    undefined = chain.isUndefined
    defined = chain.isDefined
    primitive = chain.isPrimitive 
    record = chain.isRecord
    array = chain.isArray
    iterable = chain.isIterable
    map = chain.isMap
    set = chain.isSet
    object = chain.isObject
    function = chain.isFunction
    promise = chain.isPromise
    error = chain.isError
    date = chain.isDate
    weakMap = chain.isWeakMap
    weakSet = chain.isWeakSet
    symbol = chain.isSymbol

    tuple<T extends chain.IsTupleInput>(...types: T): chain.IsTuple {
        return new chain.IsTuple(...types)
    }

    shape<T extends chain.IsShapeInput>(shape: T): chain.IsShape<T> {
        return new chain.IsShape(shape)
    }

    instanceOf<T extends chain.IsInstanceInput>(type: T): chain.IsInstance<T> {
        return new chain.IsInstance(type)
    }

    typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): chain.IsType<T> {

        if (of instanceof IsType)
            return of

        const settings = isFunc<TypeGuard<T>>(of)
            ? of instanceof TypeValidator<T>
                ? of
                : { 
                    is: of, 
                    type: of
                        .name
                        .replace(/^is/, '') || 'unknown' 
                }
            : of
        return new chain.IsType(settings)
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