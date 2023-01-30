
import { equals } from '@benzed/immutable'
import { Resolver } from '@benzed/util'

import ValidateContext from '../validate-context'
import { ValidateOptions } from '../validate'
import { ValidationError } from '../validate-error'

import { AbstractValidate, NameErrorIdSignature } from './abstract-validate'

//// Validate ////

function validate<I, O = I>(
    this: AbstractValidator<I, O>, 
    input: I, 
    options?: Partial<ValidateOptions>
): O {

    const ctx = new ValidateContext(input, options)

    const transformed = this.transform(input, ctx)

    return new Resolver(transformed)
        .then(resolved => {

            ctx.value = resolved as I

            const output = ctx.transform 
                ? ctx.value
                : input

            if (!this.isValid(output, ctx))
                throw new ValidationError(this, ctx)

            return output
        })
        .value as O
}

//// Main ////

abstract class AbstractValidator<I, O = I> extends AbstractValidate<I, O> {

    constructor(...args: NameErrorIdSignature<I>) {
        super(validate, ...args)
    }

    override error(): string {
        return this.name.includes('abstract')
            ? 'Validation failed.'
            : `Must be ${this.name}.`
    }

    isValid(input: I, ctx: ValidateContext<I>): boolean {
        return equals(input, ctx.value)
    }

    transform(input: I, _ctx: ValidateContext<I>): I | O {
        return input
    }

}

//// Exports ////

export default AbstractValidator 

export {
    AbstractValidator
}