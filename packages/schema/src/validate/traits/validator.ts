import { Trait } from '@benzed/traits'
import { isFunc, isShape } from '@benzed/util'

import { ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type AnyValidator = Validator<any,any>

//// Traits ////

/**
 * A validator contains a validate and analyze method.
 * It's expected that the analyze method adheres to the validation contract.
 */
abstract class Validator<I, O extends I> extends Trait {

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) =>
        input is Validator<Ix,Ox> =
            isShape({
                validate: isFunc,
                analyze: isFunc
            })

    /**
     * The validate method analyzes the given input and validate options.
     * If the resulting validation context contains an error, it throws
     * that error, otherwise it returns the context output.
     */
    validate(input: I, options?: ValidateOptions): O {
        const ctx = this.analyze(input, options)
        if (!ctx.result)
            throw new Error('Validation did not complete.')

        if ('error' in ctx.result)
            throw ctx.result.error 

        return ctx.result.output
    }

    /**
     * The analyze method converts the given input and options into a 
     * validation context.
     */
    abstract analyze(
        input: I, 
        options?: ValidateOptions
    ): ValidationContext<I, O>

}

//// Exports ////

export default Validator

export {
    Validator,
    AnyValidator
}