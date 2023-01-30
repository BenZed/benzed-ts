
import { equals } from '@benzed/immutable'

import { Property, Resolver } from '@benzed/util'

import ValidateContext from '../validate-context'
import { Validate, ValidateOptions } from '../validate'
import { ValidationError } from '../validate-error'

import { $$id, defineSymbol } from '../../util/symbols'
import validatorMerge from './validator-merge'
import validatorFrom from './validator-from'

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

abstract class AbstractValidator<I, O = I> extends Validate<I, O> {

    static from = validatorFrom
    static merge = validatorMerge

    constructor(id?: symbol) {

        super(validate)

        // Name from constructor, instead of the 'validate' method
        let name = this.constructor.name
        name = name
            .charAt(0)
            .toLowerCase() + name.slice(1)

        Property.name(this, name)

        // id, if provided
        if (id)
            defineSymbol(this, $$id, id)
    }

    error(): string {
        return this.name === 'Vaildator'
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