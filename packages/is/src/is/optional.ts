import { TypeOf, nil, Func } from '@benzed/util'
import { AnySchematic, Schematic } from '../schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _InheritOptional<T> = T extends AnySchematic 
    ? Optional<T> 
    : T extends Func
        ? ReturnType<T> extends AnySchematic 
            ? (...params: Parameters<T>) => Optional<ReturnType<T>>
            : T
        : T

//// Exports ////

export type Optional<T extends AnySchematic> = 
    & Schematic<TypeOf<T> | nil> 
    & {
        [K in keyof T]: K extends 'of' ? T[K] : _InheritOptional<T[K]>
    } 
    & {
        optional: Optional<T>
        required: T
    }
