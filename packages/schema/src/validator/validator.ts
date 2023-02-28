import { Copyable } from '@benzed/immutable'
import { Callable, Method } from '@benzed/traits'
import { assign } from '@benzed/util'
import { Validate, ValidateOptions } from '../validate'

import ValidationContext from '../validation-context'
import ValidationError from '../validation-error'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

/**
 * Property key for implementations of the analyze method
 */
export const $$analyze = Symbol('validation-analyze')

//// Validate Method ////

/**
 * There is only one validate method in all of @benzed/schema, and this is it:
 * 
 * Validations are conducted by creating a validation context out of an input
 * and validation options. 
 * 
 * Context is given to the scoped analyze method, which has logic to mutate 
 * the context by applying errors or output.
 * 
 * If the mutated context does not have an output, a validation error is thrown,
 * otherwise the output is returned.
 */
function analyze<I, O extends I>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](
        new ValidationContext(input, options)
    )

    if (!ctx.hasValidOutput())
        throw new ValidationError(ctx)

    return ctx.getOutput()
}

//// Validator ////

/*
 * The primary type of this library. 
 * The Validator uses the analyze validate method as it's callable signature,
 * compelling extended classes to implement the symbolic analyze method 
 * to carry out validations.
 */
export abstract class Validator<I = any, O extends I = I> extends Method<Validate<I,O>> {

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
    abstract [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>

}

// TODO FIXME
(Validator as any).prototype[Copyable.copy] = function () {
    const clone = Copyable.createFromProto(this)

    assign(clone, { [Callable.signature]: this[Callable.signature ] })

    return Callable.apply(clone)
}