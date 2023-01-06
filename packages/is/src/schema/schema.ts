import { $$copy, $$equals, Comparable, Copyable, equals } from '@benzed/immutable'
import { isFunc, isObject, Mutable, nil, Pipe, through as dummyValidatorForCopying } from '@benzed/util'

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
        super(isFunc(input) ? input : new Validator(input))
    }
    
    get validators(): Validate<unknown>[] {
        return Array.from(this) 
    }

    validates(
        input: Validate<T> | ValidatorSettings<T>
    ): this {

        const validate = isObject<ValidatorSettings<T>>(input) ? new Validator(input) : input
        
        return validate.constructor === Validator || validate.constructor === Validate  
            ? this._addValidator(validate)
            : this._setValidator(validate.constructor as typeof Validate, () => validate as Validate<unknown>)
    }

    asserts(
        isValid: ValidatorTypeGuard<T>, 
        error?: string | ValidationErrorMessage<T>
    ): this {
        return this.validates({ is: isValid, error })
    }

    transforms(
        transform: ValidatorTransform<T>,
        error?: string | ValidationErrorMessage<T>
    ): this {
        return this.validates({ transform, error })
    }

    //// Helper ////

    protected _copyWithValidators(...validators: Validate<unknown>[]): this {
        const SchemaConstructor = this.constructor as new (input: Validate<unknown>) => this
        
        const clone = new SchemaConstructor(dummyValidatorForCopying);
        (clone as Mutable<Schema>).validate = validators.length === 1 
            ? validators[0] 
            : Pipe.from(...validators)

        return clone
    }

    protected _getValidator<V extends Validate<unknown>>(Constructor: new (...args: any) => V): V | nil {
        return this.validators.find((v): v is V => v instanceof Constructor)
    }

    protected _hasValidator(Constructor: new (...args: any) => Validate<unknown>): boolean {
        return this._getValidator(Constructor) !== nil
    }

    protected _addValidator(validator: Validate<unknown>): this {
        return this._copyWithValidators(...this.validators, validator)
    }

    protected _setValidator<V extends Validate<unknown>>(
        Constructor: (new (...args: any) => V),
        update: (input: V) => Validate<unknown>,
    ): this {

        const oldValidator = this._getValidator(Constructor)
        if (!oldValidator)
            throw new Error(`${Constructor.name} validator missing`)

        const newValidator = update(oldValidator as V)

        const newValidators = this.validators.map(validator => 
            validator === oldValidator 
                ? newValidator 
                : validator
        )

        const clone = this._copyWithValidators(...newValidators)
        return clone
    }
    
    //// Copy/Comparable ////

    [$$copy](): this {
        return this._copyWithValidators(...this.validators)
    }

    [$$equals](other: unknown): other is this {
        return other instanceof Schema && 
            other.constructor === this.constructor && 
            equals(other.validators, this.validators)
    }

    //// Iterable ////
    
    *[Symbol.iterator](): IterableIterator<Validate<unknown>> {

        const validators: Iterable<Validate<unknown>> = this.validate instanceof Pipe 
            ? this.validate as Pipe 
            : [this.validate]

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
