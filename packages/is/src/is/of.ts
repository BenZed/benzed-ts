
import { Is, _IsUnwrap } from './is'

import { 
    AnySchematic, 
    IsArrayOf, 
    IsBoolean, 
    IsNumber,
    IsString, 
    IsIterable,
    IsArray 
} from '../schema'
    
import { AnyTypeGuard, IsTypeOf } from '../schema/schemas/type-of/type-of'
import { Optional } from './optional'
import { Readonly } from './readonly'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type AnyTypeOf = IsTypeOf<AnyTypeGuard, any>

type _OfArray<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends AnyTypeOf
        ? IsArrayOf<Of<F, T>>
        : IsArrayOf<T>

type _Of<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends IsArrayOf<infer Fx>
        ? _OfArray<Fx, T>

        // Also check MapOf, SetOf, RecordOf
        : IsIterable<T>

//// Types ////

export type Of<F extends AnyTypeGuard, T extends AnySchematic> = 
    F extends Optional<infer Fx> 
        ? Optional<Of<Fx,T>>
        : F extends Readonly<infer Fx>
            ? Readonly<Of<Fx,T>>
            : _Of<F,T>

//// Factory ////

export interface OF<F extends AnyTypeGuard> {
    <T extends AnySchematic>(type: T): Is<Of<F, _IsUnwrap<T>>>

    get string(): Is<Of<F, IsString>>
    get number(): Is<Of<F, IsNumber>>
    get boolean(): Is<Of<F, IsBoolean>>
    get array(): Is<Of<F, IsArray>>
    shape<T extends ShapeInput>(type: T): Is<Of<F, Shape>>
}

