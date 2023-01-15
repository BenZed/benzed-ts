import { TypeOf, Func } from '@benzed/util'
import { AnySchematic, Schematic } from '../schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper TYpes ////

type _InheritReadonly<T> = T extends AnySchematic 
    ? Readonly<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Readonly<ReturnType<T>>
            : T
        : T

//// Exports ////

export type Readonly<T extends AnySchematic> = 
    & Schematic<TypeOf<T>> 
    & {
        [K in keyof T]: _InheritReadonly<T[K]>
    }  
    & {
        readonly: Readonly<T>
        writable: T
    }