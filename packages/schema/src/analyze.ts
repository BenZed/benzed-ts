import { ValidateOptions } from './validate'

import ValidationContext from './validation-context'
import ValidationError from './validation-error'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

/**
 * Property key for implementations of the analyze method
 */
export const $$analyze = Symbol('validation-analyze')

//// Main ////

/**
 * An analyzer receives a 
 */
export abstract class Analyzer<I, O extends I> {

    static readonly analyze = $$analyze

    /**
     * Given an input and validation options, the analyze method will:
     * - create a validation context
     * - analyze the input on that context
     * - attach a validation result to the context; output or error
     * - return the context
     */
    abstract [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>
}

/**
 * There is only one validate method in all of @benzed/schema, and this is it:
 * Validations are conducted by creating a validation context out of an input
 * and validation options. 
 * 
 * Context is given to the scoped analyze method, which has logic to mutate 
 * the context by applying errors or output.
 * 
 * If the mutated context does not have an output, a validation error is thrown,
 * otherwise the output is returned.
 */
export function analyze<I, O extends I>(this: Analyzer<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](
        new ValidationContext(input, options)
    )

    if (!ctx.hasValidOutput())
        throw new ValidationError(ctx)

    return ctx.getOutput()
}
