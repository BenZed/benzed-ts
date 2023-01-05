import { equals } from '@benzed/immutable'
import { Callable, isFunc } from '@benzed/util'

import { ValidationError } from './error'
import { ValidateContext, ValidateOptions } from './context'

//// Types ////

interface ErrorMessage<T> {
    (value: T, ctx: ValidateContext<T>): string
}

interface Validate<I, O extends I = I> {
    (input: I, ctx?: ValidateOptions): O
}

interface ValidatorSettings<I, O extends I> {

    error?: string | ErrorMessage<I>

    assert?: 
    ((input: I, ctx: ValidateContext<I>) => input is O) | 
    ((input: I, ctx: ValidateContext<I>) => boolean)

    transform?: (input: I, ctx: ValidateContext<I>) => I | O

}

interface Validator<I, O extends I> extends Validate<I, O>, ValidatorSettings<I, O> {}

//// Main ////

class Validator<I, O extends I> extends Callable<Validate<I,O>> implements ValidatorSettings<I, O> {

    constructor({ transform, assert, error }: ValidatorSettings<I,O>) {

        super((input: I, options?: ValidateOptions): O => {

            const ctx = {
                transform: true,
                path: [],
                input,
                ...options,
            }
        
            const transformed = (ctx.transform || !this.assert) && this.transform 
                ? this.transform(input, ctx) 
                : input 
        
            const output = ctx.transform 
                ? transformed 
                : input 
        
            const isValid = this.assert 
                ? this.assert(output, ctx) 
                : equals(transformed, output)
            
            if (!isValid) {
                const msg = isFunc(this.error)
                    ? this.error(output, ctx) 
                    : this.error ?? 'Validation failed.'
                
                throw new ValidationError(output, ctx, msg)
            }
        
            return output as O
        })

        this.assert = assert
        this.transform = transform
        this.error = error
    }
}

//// Exports ////

export default Validator 

export {

    Validate,
    Validator,
    ValidatorSettings,

    ValidateOptions,
    ValidateContext,

}