
import { Callable, Infer } from '@benzed/util'

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
    ArrayOf,
    IterableOf,
} from '../../schema'

import { 
    AnyTypeGuard, 
    TypeOf 
} from '../../schema/schemas/type-of/type-of'

import { Is } from '../is'

import { 
    resolveSchematics,
    ResolveSchematicsInput,
    ResolveSchematicsOutput
} from './resolve-schematics'

import { 
    reduceSchematics, 
    ReduceSchematicsInput, 
    ReduceSchematicsOutput,
} from './reduce-schematics'

import { Optional } from '../optional'
import { ReadOnly } from '../readonly'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Helper Types ////

type AnyTypeOf = TypeOf<AnySchematic, unknown>

type _OfArray<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends AnyTypeOf
        ? ArrayOf<_Of<F, T>>
        : ArrayOf<T>

type _Of<F extends AnySchematic, T extends AnySchematic> = 
    F extends ArrayOf<infer Fx>
        ? _OfArray<Fx, T>

        // Also check MapOf, SetOf, RecordOf
        : F extends TypeOf<infer Fxx, any>  
            ? IterableOf<Fxx>
            : F

//// Types ////

type Of<O extends AnySchematic, T extends AnySchematic> = 
    O extends Optional<infer Tx> 
        ? Optional<Of<Tx, T>>
        : O extends ReadOnly<infer Txx>     
            ? ReadOnly<Of<Txx,T>>
            : _Of<O, T>
        
//// Types ////

type IsTo<F extends From, T extends ReduceSchematicsInput> = 
    Infer<Is<ReduceSchematicsOutput<[...F, ...T]>>, AnySchematic>

interface ToSignature<F extends From> {
    <T extends ResolveSchematicsInput>(...inputs: T): IsTo<F, ResolveSchematicsOutput<T>>
}

//// Implementation ////

type From = [AnySchematic] | []

class To<F extends From> extends Callable<ToSignature<F>> {

    readonly from: F

    constructor(...from: F) {
        super(function (
            this: To<F>, 
            ...inputs: ResolveSchematicsInput
        ) {
            const resolved = resolveSchematics(...inputs)
            const reduced = reduceSchematics(...this.from, ...resolved)
            return new Is(reduced)
        })

        this.from = from
    }
    
    get string(): IsTo<F, [String]> {
        return this(isString)
    }

    get number(): IsTo<F, [Number]> {
        return this(isNumber)
    }

    get boolean(): IsTo<F, [Boolean]> {
        return this(isBoolean)
    }

    get array(): IsTo<F, [Array]> {
        return this(isArray)
    }

}

//// Exports ////
    
export {
    To,
    ToSignature
}