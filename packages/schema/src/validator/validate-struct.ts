import { Struct } from '@benzed/immutable'

import { Validate } from '../validate'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ValidateStruct ////

/**
 * Transferrable immutable state base class for any method that validates.
 */
export abstract class ValidateStruct<I, O extends I = I> extends Struct<Validate<I,O>> { }

export type AnyValidateStruct = ValidateStruct<any,any>

