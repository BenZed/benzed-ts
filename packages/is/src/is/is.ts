import { TypeOf, Func } from '@benzed/util'

import { AnySchematic, IsArray, IsArrayOf, IsBoolean, IsNumber, IsString, IsUnknown, Schematic } from '../schema'

import { Optional } from './optional'
import { Readonly } from './readonly'
import { OR, Or } from './or'
import { IsTypeOf } from '../schema/schemas/is-type-of/is-type-of'
import { Of, OF } from './of'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Is ////

/**
 * @internal
 */
export type _IsUnwrap<T extends AnySchematic> = T extends Is<infer Tx> ? Tx : T

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

    tuple<T extends IsTupleInput>(...types: T): AnySchematic
    shape<T extends IsShapeInput>(shape: T): AnySchematic
    instanceOf<T extends IsInstanceInput>(type: T): AnySchematic
    typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): AnySchematic

}

//// Is ////

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
 * in this Is<> cursor
 */
type _InheritIs<T> = T extends AnySchematic 
    ? Is<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Is<ReturnType<T>>
            : T
        : T

export type Is<T extends AnySchematic> = 
    & Schematic<TypeOf<T>> 
    & _Fill<{
        [K in keyof T]: K extends 'of' 
            ? OF<T>
            : _InheritIs<T[K]>
    }, {
        or: OR<T extends Or<infer Tx> ? Tx : [T]>
        optional: Is<Optional<T>>
        readonly: Is<Readonly<T>>
    }>

//// Factories ////

export interface IS extends _Factory {
    <T extends AnySchematic>(type: T): Is<_IsUnwrap<T>>

    get string(): Is<IsString>
    get number(): Is<IsNumber>
    get boolean(): Is<IsBoolean>
    get array(): Is<IsArray>
    // tuple<T extends IsTupleInput>(...types: T): AnySchematic
    // shape<T extends IsShapeInput>(shape: T): AnySchematic
    // instanceOf<T extends IsInstanceInput>(type: T): AnySchematic
    // typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): AnySchematic}
}