import { nil } from '@benzed/util'
import { equals, isFunction, isObject } from '@benzed/immutable'

import { 

    context,
    ValidateContext, 
    ValidateOptions

} from './context'

import { ErrorMessage, ValidationError } from './error'

//// Types ////

type IsValid<T = unknown> = ((i: T, ctx: ValidateContext) => boolean)

type Transform<I = unknown, O extends I = I> = (i: I, ctx: ValidateContext) => O

type Validator<I = unknown, O extends I = I> = {
    
    /**
     * Error message to be used if validation fails.
     */
    readonly msg?: string | ErrorMessage<I> 

    /**
     * Method to transform a value, if transformations are enabled.
     */
    readonly transform?: Transform<I,O>
    
    /**
     * Assert that a given value is valid.
     * 
     * A validation error will be thrown if this method returns false.
     */
    readonly assert?: IsValid<I> | ((i: unknown, ctx: ValidateContext) => i is I)

}

interface Validate<I = unknown, O extends I = I> {
    (input: I, ctx?: Partial<ValidateOptions>): O
}

//// Helper ////

function isOptional<T extends object>(input: T): input is T & { optional: true } {
    return (isObject(input) || isFunction(input)) && (input as { optional: boolean }).optional === true 
}

function isMutable<T extends object>(input: T): input is T & { mutable: true } {
    return (isObject(input) || isFunction(input)) && (input as { mutable: boolean }).mutable === true 
}
//// Validator ////

function validate(
    this: { validators: readonly Validator[] }, 
    input: unknown, 
    options?: Partial<ValidateOptions>
): unknown {

    const ctx = context({ input, ...options })

    for (const { transform, assert, msg } of this.validators) {
        
        const transformed = (ctx.transform || !assert) && transform ? transform.call(this, input, ctx) : input

        const output = ctx.transform ? transformed : input

        const isValid = assert ? assert.call(this, output, ctx) : equals(output, transformed)
        if (!isValid && output === nil && isOptional(this))
            return nil
        
        if (!isValid)
            throw new ValidationError(output, ctx, msg)

        input = output
    }

    return input
}

//// Exports ////

export default validate

export {
    validate,
    Validate,

    IsValid,
    Transform,

    Validator,

    isOptional,
    isMutable
}
