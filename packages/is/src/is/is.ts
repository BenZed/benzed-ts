import { TypeOf as Infer, Func } from '@benzed/util'

import { 
    AnySchematic, 
    Array, 
    Boolean, 
    Number, 
    String, 
    Schematic 
} from '../schema'

import { Optional } from './optional'
import { Readonly } from './readonly'
import { OR, Or } from './or'
import { OF } from './of'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

////  ////

/**
 * @internal
 */
export type _UnwrapIs<T extends AnySchematic> = T extends Is<infer Tx> ? Tx : T

/**
 * @internal
 */
export interface _Factory {

    get string(): AnySchematic
    get boolean(): AnySchematic
    get number(): AnySchematic
    get integer(): AnySchematic

    get primitive(): AnySchematic
    get defined(): AnySchematic
    get bigint(): AnySchematic
    get symbol(): AnySchematic

    get null(): AnySchematic
    get nil(): AnySchematic
    get nan(): AnySchematic
    get undefined(): AnySchematic

    get iterable(): AnySchematic
    get array(): AnySchematic
    get map(): AnySchematic
    get set(): AnySchematic

    get record(): AnySchematic
    get object(): AnySchematic
    get function(): AnySchematic

    get date(): AnySchematic
    get promise(): AnySchematic
    get regexp(): AnySchematic
    get error(): AnySchematic
    get weakMap(): AnySchematic
    get weakSet(): AnySchematic

    tuple<T extends TupleInput>(...types: T): AnySchematic
    shape<T extends ShapeInput>(shape: T): AnySchematic
    instanceOf<T extends InstanceInput>(type: T): AnySchematic
    typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): AnySchematic

}

//// Helper Types ////

/**
 * Apply properties from B to A that arn't defined in A
 */
type _Fill<A,B> = {
    [K in keyof A | keyof B]: K extends keyof A 
        ? A[K] 
        : K extends keyof B 
            ? B[K] 
            : never
}

/**
 * Re-wrap the result of a method or getting or a schematic
 * in this <> cursor
 */
type _Inherit<T> = T extends AnySchematic 
    ? Is<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Is<ReturnType<T>>
            : T
        : T

export type Is<T extends AnySchematic> = 
    & Schematic<Infer<T>> 
    & _Fill<{
        [K in keyof T]: K extends 'of' 
            ? OF<T>
            : _Inherit<T[K]>
    }, {
        or: OR<T extends Or<infer Tx> ? Tx : [T]>
        optional: Is<Optional<T>>
        readonly: Is<Readonly<T>>
    }>

//// Factories ////

export interface IS extends _Factory {
    <T extends AnySchematic>(type: T): Is<_UnwrapIs<T>>

    get string(): Is<String>
    get number(): Is<Number>
    get boolean(): Is<Boolean>
    get array(): Is<Array>
    // tuple<T extends TupleInput>(...types: T): AnySchematic
    // shape<T extends ShapeInput>(shape: T): AnySchematic
    // instanceOf<T extends InstanceInput>(type: T): AnySchematic
    // typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): AnySchematic}
}