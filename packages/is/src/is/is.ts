import { TypeOf as TypeGuardOutput, Func } from '@benzed/util'

import { AnySchematic } from '../schema'

import { Optional } from './optional'
import { Readonly } from './readonly'
import { To } from './to'

import Ref from './util/ref'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

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
 * in this cursor
 */
type _InheritIs<T> = T extends AnySchematic 
    ? Is<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Is<ReturnType<T>>
            : T
        : T

//// Is ////

/**
 * @internal
 */
type IsRef<T extends AnySchematic> = 
    T extends Is<infer Tx> ? Tx : T

type Is<T extends AnySchematic> = 
    
    & Ref<TypeGuardOutput<T>>

    & _Fill<{
        get or(): To<[T]>
        get optional(): Is<Optional<T>>
        get readonly(): Is<Readonly<T>>
    },{
        [K in keyof T]: K extends 'of' 
            ? never // OfTo<T>
            : _InheritIs<T[K]>
    }>

const Is = class extends Ref<unknown> {

    get or (): To<[AnySchematic]> {
        return new To(this.ref)
    }

    get optional(): Is<Optional<AnySchematic>> {
        const optional = new Optional(this.ref)
        return new Is(optional)
    }

} as unknown as (
    new <T extends AnySchematic>(ref: T) => Is<IsRef<T>>
)

//// Exports ////
    
export {
    Is,
    IsRef,
}