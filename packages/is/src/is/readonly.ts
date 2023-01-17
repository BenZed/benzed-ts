import { TypeOf, Func } from '@benzed/util'
import { AnySchematic, Schematic } from '../schema'
import { Ref } from './util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper TYpes ////

type _Readonly<T> = Readonly<T>

type _InheritReadonly<T> = T extends AnySchematic 
    ? ReadOnly<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Readonly<ReturnType<T>>
            : T
        : T

//// Types ////

type ReadOnly<T extends AnySchematic> = 
    & Schematic<_Readonly<TypeOf<T>>> 
    & {
        [K in keyof T]: K extends 'of' 
            ? T[K] 
            : _InheritReadonly<T[K]>
    }  
    & {
        writable: T
    }

//// Implementation ////

const ReadOnly = class extends Ref<unknown> {

    get writable(): AnySchematic {
        return this.ref
    }

} as unknown as new <T extends AnySchematic>(input:T) => ReadOnly<T>

//// Exports ////

export {
    ReadOnly
}