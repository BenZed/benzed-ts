import { TypeOf as TypeGuardOutput, Func, nil } from '@benzed/util'

import { AnySchematic } from '../schema'

import { Optional } from './optional'
import { ReadOnly } from './readonly'
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
        get readonly(): Is<ReadOnly<T>>
    },{
        [K in keyof T]: K extends 'of'
            ? T[K] extends AnySchematic
                ? To<[T]>
                : T[K]
            : _InheritIs<T[K]>
    }>

const Is = class extends Ref<unknown> {

    get or (): unknown {
        return new To(this.ref)
    }

    get of(): unknown {

        if ('of' in this.ref === false)
            return nil

        return new To(this.ref)
    }

    get optional(): unknown {
        const optional = new Optional(this.ref)
        return new Is(optional)
    }

    get readonly(): unknown {
        const readonly = new ReadOnly(this.ref)
        return new Is(readonly)
    }

} as unknown as (
    new <T extends AnySchematic>(ref: T) => Is<IsRef<T>>
)

//// Exports ////
    
export {
    Is,
    IsRef,
}