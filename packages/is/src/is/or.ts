import { Last } from '@benzed/array'
import { Func, TypesOf } from '@benzed/util'

import { Is, _UnwrapIs } from './is'
import { AnySchematic, Array, ArrayOf, Boolean, Number, String, Schematic } from '../schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Helper TYpes ////

type _ReplaceLast<T extends AnySchematic[], A extends AnySchematic> = T extends [...infer Tf, unknown]
    ? [...Tf, A]
    : [A]

type _InheritOr<S, T extends AnySchematic[]> = S extends AnySchematic 
    ? Or<_ReplaceLast<T,S>>
    : S extends Func
        ? ReturnType<S> extends AnySchematic 
            ? (...params: Parameters<S>) => Or<_ReplaceLast<T, ReturnType<S>>>
            : S
        : S
        
//// Or ////

export type Or<T extends AnySchematic[]> = Schematic<TypesOf<T>[number]> & {
    [K in keyof Last<T>]: _InheritOr<Last<T>[K], T>
} & {
    types: T
}

//// Factory ////

export interface OR<S extends AnySchematic[]> {
    <T extends AnySchematic>(type: T): Is<Or<[...S, ..._UnwrapIs<T> extends Or<infer Tx> ? Tx : [_UnwrapIs<T>]]>>

    get string(): Is<Or<[...S, String]>>
    get number(): Is<Or<[...S, Number]>>
    get boolean(): Is<Or<[...S, Boolean]>>
    get array(): Is<Or<[...S, Array]>>
    arrayOf<T extends AnySchematic>(type: T): Is<Or<[...S, ArrayOf<_UnwrapIs<T>>]>>
    shape<T extends ShapeInput>(type: T): Is<Or<[...S, Shape<T>]>>
}

