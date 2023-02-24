import { Method } from '@benzed/traits'
import ValidationContext from './validation-context'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Validate Types ////

export interface ValidateOptions {
    /**
     * True if transformations are to be applied
     * during in the validation call, false if not.
     */
    readonly transform?: boolean

    /**
     * Optional key to associate with the validated value,
     * useful for sub validations of container values.
     */
    readonly key?: PropertyKey
}

/**
 * The validate method takes an input an optionally a set of validate options and
 * either returns a valid output or throws a validation error.
 */
export interface Validate<I = any, O extends I = I> {
    (input: I, options?: ValidateOptions): O 
}

/**
 * Input type of a validate method
 */
export type ValidateInput<V extends Validate> = 
    V extends Validate<infer I, any> 
        ? I 
        : unknown

/**
 * Output type of a validate method
 */
export type ValidateOutput<V extends Validate> =
    V extends Validate<any, infer O> 
        ? O
        : unknown

type AbstractValidateConstructor = abstract new <I,O extends I = I>() => Validate<I,O> & Analyze<I,O>
// the abstract validate constructor is declared in this way --------------------------^
// so that implementors of the Validate interface arn't
// beholden to using the Analyze symbol. All the other 
// validators in this library will, however.

interface ValidateConstructor extends AbstractValidateConstructor {

    /**
     * The analyze symbol is the key used for the analyze method 
     * in extended Validators
     */
    readonly analyze: typeof $$analyze

}

//// Analyze Types ////

declare abstract class Analyze<I = any, O extends I = I> {

    /**
     * Given an input and validation options, the analyze method will:
     * - create a validation context
     * - analyze the input on that context
     * - attach a validation result to the context; output or error
     * - return the context
     */
    abstract [$$analyze](input: I, options?: ValidateOptions): ValidationContext<I, O>
}

//// Implementation ////

export const $$analyze = Symbol('validation-analyze')

/**
 * There is only one validate method in all of @benzed/schema, and this is it:
 */
function analyze<I, O extends I>(this: Analyze<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](input, options)

    if (!ctx.result)
        throw new Error('Validation did not complete.')

    if ('error' in ctx.result)
        throw ctx.result.error 

    return ctx.result.output
}

/**
 * The extendable implementation of the Validate interface makes use of the symbolc analyze method.
 */
export const Validate = class <I = any, O extends I = I> extends Method<(i: I, options?: ValidateOptions) => O> {

    static readonly analyze: typeof $$analyze = $$analyze

    constructor() {
        super(analyze)
    }

    [$$analyze](input: I, options?: ValidateOptions): ValidationContext<I, O> {
        void input
        void options
        // Implementation only exists here to shut typescript up. Method is abstract.
        throw new Error(`${this.constructor.name} ${String($$analyze)} method not implemented.`)
    }

} as ValidateConstructor

