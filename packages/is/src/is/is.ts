import { TypeOf as TypeGuardOutput, Func } from '@benzed/util'

import { 
    Schematic, 
    AnySchematic, 
} from '../schema'

import { Optional } from './optional'
import { Readonly } from './readonly'
import RefSchematic from './util/ref'

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
type IsRef<T extends AnySchematic> = T extends Is<infer Tx> ? Tx : T

type Is<T extends AnySchematic> = 
    
    & Schematic<TypeGuardOutput<T>>

    & _Fill<{
        [K in keyof T]: _InheritIs<T[K]>
    }, {
        /**
         * @internal
         */
        readonly ref: T
    }>

// & _Fill<{
//     [K in keyof T]: K extends 'of' 
//         ? OfTo<T>
//         : _InheritIs<T[K]>
// }, {
//     or: OrTo<T extends Or<infer Tx> ? Tx : [T]>
//     optional: Is<Optional<T>>
//     readonly: Is<Readonly<T>>

//     /**
//      * @internal
//      */
//     readonly ref: T
// }>

const Is = class extends RefSchematic<AnySchematic> {

    constructor(ref: AnySchematic) {

        // unwrap
        while (ref instanceof Is)
            ref = ref.ref

        super(ref)
    }

    protected _refInherit(): void {

        //
    }

} as (new <T extends AnySchematic>(ref: T) => Is<T>)

//// Exports ////
    
export {
    Is,
    IsRef,
}