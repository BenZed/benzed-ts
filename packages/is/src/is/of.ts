
import { Is, _UnwrapIs } from './is'

import { 
    AnySchematic, 
    ArrayOf, 
    Boolean, 
    Number,
    String, 
    IterableOf,
    Array 
} from '../schema'
    
import { AnyTypeGuard, TypeOf } from '../schema/schemas/type-of/type-of'
import { Optional } from './optional'
import { Readonly } from './readonly'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type AnyTypeOf = TypeOf<AnyTypeGuard, any>

type _OfArray<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends AnyTypeOf
        ? ArrayOf<Of<F, T>>
        : ArrayOf<T>

type _Of<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends ArrayOf<infer Fx>
        ? _OfArray<Fx, T>

        // Also check MapOf, SetOf, RecordOf
        : IterableOf<T>

//// Types ////

export type Of<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends Optional<infer Fx> 
        ? Optional<Of<Fx,T>>
        : F extends Readonly<infer Fx>
            ? Readonly<Of<Fx,T>>
            : _Of<F,T>

//// Factory ////

export interface OF<F extends AnyTypeGuard> {
    <T extends AnySchematic>(type: T): Is<Of<F, _UnwrapIs<T>>>

    get string(): Is<Of<F, String>>
    get number(): Is<Of<F, Number>>
    get boolean(): Is<Of<F, Boolean>>
    get array(): Is<Of<F, Array>>
    shape<T extends ShapeInput>(type: T): Is<Of<F, Shape>>
}

