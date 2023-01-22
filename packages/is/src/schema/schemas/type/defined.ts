import { Primitive, isDefined as _isDefined, nil } from '@benzed/util'
import SchemaBuilder from '../../_old-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

type defined = Exclude<Primitive, nil | null> | object

//// Exports ////

export interface Defined extends SchemaBuilder<defined> {}
export const isDefined: Defined = new SchemaBuilder({ 
    is: (i: unknown): i is defined => _isDefined(i),
    error: 'Must be defined'
})