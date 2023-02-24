import { Validate, ValidateOptions } from './validate'
import ValidationContext from './validation-context'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

export const $$analyze = Symbol('validator-analyze')

//// The Validate Function ////

/**
 * In the entire @benzed/schema library there is only one 
 * validate function, and this is it:
 */
function validate<I, O extends I>(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[Validator.analyze](input, options)

    if (!ctx.result)
        throw new Error('Validation did not complete.')

    if ('error' in ctx.result)
        throw ctx.result.error 

    return ctx.result.output

}

//// The Validator Class ////

/**
 * The most commonly extended class of this library.
 */
export abstract class Validator<I = any, O extends I = I> extends Validate<I,O> {

    /**
     * The analyze symbol is the key used for the analyze method 
     * in extended Validators
     */
    static readonly analyze: typeof $$analyze = $$analyze

    constructor() {
        super(validate)
    }

    /**
     * The analyze method takes a given input and optional validate options.
     * It creates a validation context, analyzes the input, and assigns
     * a result to the validation context: output or error.
     */
    abstract [$$analyze](input: I, options?: ValidateOptions): ValidationContext<I, O>

}
