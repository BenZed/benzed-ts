import { TypeOf, Func } from '@benzed/util'
import { AnySchematic, Schematic } from '../schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper TYpes ////

type _InheritReadonly<T> = T extends AnySchematic 
    ? _Readonly<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Readonly<ReturnType<T>>
            : T
        : T

//// Exports ////

type _Readonly<T extends AnySchematic> = 
    & Schematic<Readonly<TypeOf<T>>> 
    & {
        [K in keyof T]: K extends 'of' ? T[K] : _InheritReadonly<T[K]>
    }  
    & {
        readonly: Readonly<T>
        writable: T
    }

export {
    _Readonly as Readonly
}