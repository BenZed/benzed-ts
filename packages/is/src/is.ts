
import { chain, Schema, SchemaFrom } from './schema'

import { TypeGuard } from '@benzed/util'
import { TypeValidatorSettings } from './validator'

//// Main ////

class Is extends chain.ChainableSchemaFactory<SchemaFrom> 
    implements chain.ChainableSchemaFactoryInterface {

    constructor() {
        super(Schema.from)
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
    record = chain.Record
    array = chain.Array
    iterable = chain.Iterable
    map = chain.Map
    set = chain.Set
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

    enum<T extends chain.IsEnumInput>(...options: T): chain.IsEnum<T> {
        return new chain.IsEnum(...options)
    }

    instanceOf<T extends chain.IsInstanceInput>(type: T): chain.IsInstance<T> {
        return new chain.IsInstance(type)
    }

    typeOf<T extends TypeGuard<unknown> | TypeValidatorSettings<unknown>>(is: T): chain.IsType<T> {
        return new chain.IsType({ is })
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