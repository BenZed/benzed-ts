import { Primitive } from '@benzed/util'

import { 
    AnySchematic, 

    Array,
    isArray,
    
    Boolean,
    isBoolean,
    
    Number,
    isNumber, 

    String,
    isString,
    InstanceInput,
    Value,
    Instance, 
} from '../schema'
import { Is } from './is'

import { 
    ResolveSchematic,
    ResolveSchematicMap,

    resolveSchematics, 
    ResolveSchematicsInput, 
    ResolveSchematicsOutput
} from './util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Types ////

interface IsToSignature {
    <T extends Primitive>(value: T): Is<Value<T>>
    <T extends InstanceInput>(type: T): Is<Instance<T>>
    <T extends AnySchematic>(schema: T): Is<T>
    // <T extends ShapeInput>(shape: T): ResolveSchematics<[...S, T]>
    // <T extends TupleInput>(tuple: T): ResolveSchematics<[...S, T]>
    <T extends ResolveSchematicsInput>(...options: T): Is<ResolveSchematicsOutput<T>>
}

//// Implementation ////

class IsTo extends ResolveSchematic<IsToSignature> implements ResolveSchematicMap {

    constructor() {
        super(function (...inputs: ResolveSchematicsInput) {
            return new Is(resolveSchematics(...inputs)) as any
        })
    }
    
    get string(): Is<String> {
        return new Is(isString)
    }

    get number(): Is<Number> {
        return new Is(isNumber)
    }

    get boolean(): Is<Boolean> {
        return new Is(isBoolean)
    }

    get array(): Is<Array> {
        return new Is(isArray)
    }

}

//// Singleton ////

const is = new IsTo

//// Exports ////

export default is

export {
    is,
    IsTo,
    IsToSignature
}