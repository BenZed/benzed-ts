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

interface OrToSignature<F extends AnySchematic> {
    <T extends Primitive>(value: T): ResolveSchematicsOutput<[F, Value<T>]>
    <T extends InstanceInput>(type: T): ResolveSchematicsOutput<[F, Instance<T>]>
    <T extends AnySchematic>(schema: T): ResolveSchematicsOutput<[F, T]>
    // <T extends ShapeInput>(shape: T): ResolveSchematicsOutput<[F, T]>
    // <T extends TupleInput>(tuple: T): ResolveSchematicsOutput<[F, T]>
    <T extends ResolveSchematicsInput>(...options: T): ResolveSchematicsOutput<[F, ...T]>
}

//// Implementation ////

class OrTo<F extends AnySchematic> extends ResolveSchematic<OrToSignature<F>> implements ResolveSchematicMap {

    constructor(readonly from: F) {
        super(function (this: OrTo<F>, ...inputs: ResolveSchematicsInput) {
            return resolveSchematics(this.from, ...inputs)
        })
    }
    
    get string(): ResolveSchematicsOutput<[F, String]> {
        return this(isString)
    }

    get number(): ResolveSchematicsOutput<[F, Number]> {
        return this(isNumber)
    }

    get boolean(): ResolveSchematicsOutput<[F, Boolean]> {
        return this(isBoolean)
    }

    get array(): ResolveSchematicsOutput<[F, Array]> {
        return this(isArray)
    }

}

//// Exports ////
    
export {
    OrTo,
    OrToSignature
}