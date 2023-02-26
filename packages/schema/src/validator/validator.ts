import { Callable, Traits } from '@benzed/traits'
import { define } from '@benzed/util'
import { Validate, ValidateOptions } from '../validate'

import ValidationContext from '../validation-context'
import ValidationError from '../validation-error'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

export const $$analyze = Symbol('validation-analyze')

/**
 * There is only one validate method in all of @benzed/schema, and this is it
 */
function analyze<I, O extends I>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](
        new ValidationContext(input, options)
    )

    if (!ctx.hasOutput())
        throw new ValidationError(ctx)

    return ctx.getOutput()
}

//// Main ////

abstract class Analyze<I, O extends I> {

    get [Callable.signature]() {
        return analyze
    }

    abstract [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>
}

export interface Validator<I = any, O extends I = I> extends Analyze<I,O>, Validate<I,O> {

}

type AbstractValidatorConstructor = abstract new <I, O extends I>() => Validator<I,O>

interface ValidatorConstructor extends AbstractValidatorConstructor {
    readonly analyze: typeof $$analyze
}

export const Validator = class extends Traits.add(Analyze, Callable) {

    static readonly analyze = $$analyze;

    [$$analyze](ctx: ValidationContext): ValidationContext {
        void ctx
        throw new Error('Not yet implemented')
    }

} as ValidatorConstructor

// /**
//  * The extendable implementation of the Validate interface makes use of the symbolc analyze method.
//  */
// export abstract class Validator<I = any, O extends I = I> extends Validate<I, O> {

//     static readonly analyze: typeof $$analyze = $$analyze

//     constructor() {
//         super(analyze)
//     }

//     /**
//      * Given an input and validation options, the analyze method will:
//      * - create a validation context
//      * - analyze the input on that context
//      * - attach a validation result to the context; output or error
//      * - return the context
//      */
//     abstract [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>

// }

