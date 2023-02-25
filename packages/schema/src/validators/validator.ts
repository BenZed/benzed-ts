import { Validate, ValidateOptions } from '../validate'

import ValidationContext from '../validation-context'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

export const $$analyze = Symbol('validation-analyze')

/**
 * There is only one validate method in all of @benzed/schema, and this is it:
 */
function analyze<I, O extends I>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](input, options)

    if (!ctx.result)
        throw new Error('Validation did not complete.')

    if ('error' in ctx.result)
        throw ctx.result.error 

    return ctx.result.output
}

//// Main ////

/**
 * The extendable implementation of the Validate interface makes use of the symbolc analyze method.
 */
export abstract class Validator<I = any, O extends I = I> extends Validate<I, O> {

    static readonly analyze: typeof $$analyze = $$analyze

    constructor() {
        super(analyze)
    }

    /**
     * Given an input and validation options, the analyze method will:
     * - create a validation context
     * - analyze the input on that context
     * - attach a validation result to the context; output or error
     * - return the context
     */
    abstract [$$analyze](input: I, options?: ValidateOptions): ValidationContext<I, O>

} 

