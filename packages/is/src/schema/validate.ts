
import { 
    context,
    ValidateContext, 
    ValidateOptions 
} from './context'

import { ErrorMessage, ValidationError } from './error'

//// Types ////

type Assert<T = unknown> = (i: Readonly<T>, ctx: ValidateContext) => boolean

type Transform<I = unknown, O extends I = I> = (i: Readonly<I>, ctx: ValidateContext) => O

type Validator<I = unknown, O extends I = I> = {
    
    /**
     * Error message to be used if validation fails.
     */
    readonly msg: ErrorMessage<I> 
    
} & ({ 

    /**
     * Method to transform a value, if transformations are enabled.
     */
    readonly transform: Transform<I,O>
    
    /**
     * Method to check if a transformed value is
     * equal to it's input value. 
     * 
     * If transformations are disallowed for a validation, a
     * validation error will be thrown if this method returns false.
     * 
     * Defaults to deep equality.
     */
    readonly equals: (a: unknown, b: unknown) => boolean

} | { 

    /**
     * Assert that a given value is valid.
     * 
     * A validation error will be thrown if this method returns false.
     */
    readonly assert: Assert<I> 

})

interface Validate<I = unknown, O extends I = I> {
    (input: Readonly<I>, ctx?: Partial<ValidateOptions>): O
}

//// Validator ////

function validate(
    this: { validators: readonly Validator[] }, 
    input: Readonly<unknown>, 
    options?: Partial<ValidateOptions>
): unknown {

    const ctx = context({ input, ...options })
    
    for (const validator of this.validators) {
        
        const isTransform = 'transform' in validator 
        const output = isTransform 
            ? validator.transform(input, ctx) 
            : validator.assert(input, ctx)

        if (
            // assertion failed
            !isTransform && !output ||
            
            // transform failed
            isTransform && !ctx.transform && !validator.equals(output, input)
        )
            throw new ValidationError(validator.msg(input), ctx)

        // apply transform
        else if (isTransform && ctx.transform)
            input = output as Readonly<unknown>
    }

    return input
}

//// Exports ////

export default validate

export {
    validate,
    Validate,

    Assert,
    Transform,

    Validator
}
