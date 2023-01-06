import { $$copy, $$equals, Comparable, Copyable, equals, push, splice } from '@benzed/immutable'
import { isFunc, isNumber, nil, Pipe } from '@benzed/util'

import { 
    ValidationErrorMessage, 
    
    Validate, 
    ValidatorSettings, 
    
    Validator, 
    ValidatorTypeGuard,
    ValidatorTransform
} from '../validator'

import Schematic from './schematic'

//// Type ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Infer<S extends Schema<any>> = S extends Schema<infer T> ? T : unknown

type Assert<T> = T extends Schema<infer Tx> 
    ? Assert<Tx> 
    : (input: unknown) => asserts input is T

class Schema<T = unknown> extends Schematic<T> implements Iterable<Validate<unknown>>, Copyable, Comparable {

    constructor(validate: Validate<unknown, T>)
    constructor(settings: ValidatorSettings<unknown, T>)
    constructor(input: Validate<unknown, T> | ValidatorSettings<unknown, T>) {
        super(Pipe.from(isFunc(input) ? input: new Validator(input)))
    }
    
    get validators(): Validate<unknown>[] {
        return Array.from(this)
    }

    validates(
        settings: ValidatorSettings<T>,
        id?: number | string | symbol
    ): this {

        const index = id === nil 
            ? -1 
            : this.validators.findIndex((v, i) => v.id === id || i === id)

        const validate = new Validator(settings)
        if (!isNumber(id))
            validate.id = id

        const validators = index in this.validators 
            ? splice(this.validators, index, 1, validate)
            : push(this.validators, validate)

        return this._copyWithValidators(validators)
    }

    asserts(
        isValid: ValidatorTypeGuard<T>, 
        error?: string | ValidationErrorMessage<T>,
        id?: number | string | symbol
    ): this {
        return this.validates({ is: isValid, error }, id)
    }

    transforms(
        transform: ValidatorTransform<T>,
        error?: string | ValidationErrorMessage<T>,
        id?: number | string | symbol
    ): this {
        return this.validates({ transform, error }, id)
    }

    //// Copy/Comparable ////

    private _copyWithValidators(validators: Validate<unknown>[]): this {
        const Constructor = this.constructor as new (input: Validate<unknown, T>) => this
        return new Constructor(Pipe.from(...validators) as Validate<unknown, T>)
    }
    
    [$$copy](): this {
        return this._copyWithValidators(this.validators)
    }

    [$$equals](other: unknown): other is this {
        return other instanceof Schema && 
            other.constructor === this.constructor && 
            equals(other.validators, this.validators)
    }

    //// Iterable ////
    
    *[Symbol.iterator](): IterableIterator<Validate<unknown>> {
        const validators = this.validate instanceof Pipe ? this.validate as Pipe : [this.validate]
        for (const validator of validators)
            yield validator
    }
}

//// Exports ////

export default Schema

export {
    Schema,

    Infer,
    Assert
}
