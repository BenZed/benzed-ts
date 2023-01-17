import { capitalize } from '@benzed/string'
import { TypeOf as TypeGuardOutput, Func, Property, keysOf, isFunc, nil } from '@benzed/util'

import { 
    Schematic, 
    AnySchematic, 
} from '../schema'

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

const Is = class extends Ref<AnySchematic> {

    constructor(ref: AnySchematic) {
        super(ref)
    }

    //// Overrides ////
    
    protected _callRefMethod(key: keyof AnySchematic): (...args: unknown[]) => unknown {
        return (...args: unknown[]) =>
            this._wrapIfSchematic((this.ref[key] as Func)(...args))
    }
    
    protected _getRefValue(key: keyof AnySchematic): () => unknown {
        return () => this._wrapIfSchematic(this.ref[key])
    }

    protected _setRefValue(key: keyof AnySchematic): (value: unknown) => void {
        return (value: unknown) => {
            (this.ref as any)[key] = value
        }
    }

} as unknown as (new <T extends AnySchematic>(ref: T) => Is<T>)

//// Exports ////
    
export {
    Is,
    IsRef,
}