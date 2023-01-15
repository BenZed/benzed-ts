import { Last } from '@benzed/array'
import { Func, TypesOf } from '@benzed/util'

import { Is, _IsUnwrap } from './is'
import { AnySchematic, IsArray, IsArrayOf, IsBoolean, IsNumber, IsString, Schematic } from '../schema'

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
    <T extends AnySchematic>(type: T): Is<Or<[...S, ..._IsUnwrap<T> extends Or<infer Tx> ? Tx : [_IsUnwrap<T>]]>>

    get string(): Is<Or<[...S, IsString]>>
    get number(): Is<Or<[...S, IsNumber]>>
    get boolean(): Is<Or<[...S, IsBoolean]>>
    get array(): Is<Or<[...S, IsArray]>>
    arrayOf<T extends AnySchematic>(type: T): Is<Or<[...S, IsArrayOf<_IsUnwrap<T>>]>>
    shape<T extends ShapeInput>(type: T): Is<Or<[...S, Shape<T>]>>
}

