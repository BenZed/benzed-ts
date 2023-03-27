import { ArrayValidator, Validator } from '@benzed/schema'
import { $unknown, Unknown } from '../unknown'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

//// Types ////

export type ArrayOf<V extends Validator> = 
    ArrayValidator<V>

interface ArrayConstructor {
    new <V extends Validator>(validator: V): ArrayOf<V>
}

//// Schema ////

export const ArrayOf = class Array extends ArrayValidator<Validator> { } as ArrayConstructor

export type Array = ArrayOf<Unknown>

export const $array: Array = new ArrayOf($unknown)