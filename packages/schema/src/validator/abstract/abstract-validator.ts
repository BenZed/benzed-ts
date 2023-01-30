
import { equals } from '@benzed/immutable'

import { assign, defined, isString, nil, Property, Resolver } from '@benzed/util'

import ValidateContext from '../validate-context'
import { Validate, ValidateOptions } from '../validate'
import { ValidationError, ValidationErrorInput } from '../validate-error'

import { $$id, defineSymbol } from '../../util/symbols'

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

function setName(object: object): void {
    let name = object.constructor.name
    name = name
        .charAt(0)
        .toLowerCase() + name.slice(1)

    Property.name(object, name)
}

function setError<T>(object: object, error: ValidationErrorInput<T> | nil): void {
    assign(
        object, 
        defined({ 
            error: isString(error) ? () => error : error 
        })
    )
}

function setId(object: object, id: symbol | nil): void {
    // id, if provided
    if (id)
        defineSymbol(object, $$id, id)
}

//// Main ////

abstract class AbstractValidator<I, O = I> extends Validate<I, O> {

    constructor(error?: ValidationErrorInput<I>, id?: symbol) {

        super(validate)

        setName(this)
        setError(this, error)
        setId(this, id)

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