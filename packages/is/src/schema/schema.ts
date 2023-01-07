import { $$copy, $$equals, Comparable, Copyable, equals } from '@benzed/immutable'
import { isString, isSymbol, Mutable, nil, Pipe, TypeGuard } from '@benzed/util'
import { pluck } from '@benzed/array'

import { 
    ValidationErrorMessage, 
    
    Validate, 
    ValidatorSettings, 
    
    Validator, 
    ValidatorTypeGuard,
    ValidatorTransform,
    ValidatorPredicate
} from '../validator'

import Schematic from './schematic'
import type { schemaFrom } from './schema-from'

//// Type ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-var-requires
*/

//// Types ////

type Schemas<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    ? [Schema<T1>, ...Schemas<Tr>]
    : []

class Schema<T = any> extends Schematic<T> implements Iterable<Validate<unknown>>, Copyable, Comparable {

    static get from(): typeof schemaFrom {
        return require('./schema-from').schemaFrom
    }

    constructor(validate: Validate<unknown, T>)
    constructor(settings: ValidatorSettings<unknown, T>)
    constructor(input: Validate<unknown, T> | ValidatorSettings<unknown, T>) {
        super(Validator.from(input))
    }
    
    get validators(): Validate<unknown>[] {
        return Array.from(this) 
    }

    validates(
        input: Validate<T> | ValidatorSettings<T>
    ): this {

        const validate = Validator.from(input)
        return 'id' in validate && (isString(validate.id) || isSymbol(validate.id))
            ? this._setValidatorById(validate.id, () => validate)
            : this._addValidator(validate)
    }

    asserts(
        isValid: ValidatorTypeGuard<T> | ValidatorPredicate<T>, 
        error?: string | ValidationErrorMessage<T>,
        id?: string | symbol
    ): this {
        return this.validates({ is: isValid, error, id })
    }

    transforms(
        transform: ValidatorTransform<T>,
        error?: string | ValidationErrorMessage<T>,
        id?: string | symbol
    ): this {
        return this.validates({ transform, error, id })
    }

    //// Helper ////

    protected _copyWithValidators(...validators: Validate<unknown>[]): this {

        const Constructor = this.constructor as new (...params: any) => this
        
        const clone = new Constructor();

        (clone as Mutable<Schema>).validate = Validator.from(...validators)

        return clone
    }

    protected _addValidator(validator: Validate<T>): this {
        return this._copyWithValidators(...this.validators, validator as Validator<unknown>)
    }

    protected _addValidatorShortcut(): this {
        return this
    }

    protected _setValidatorByType<C extends new (...args: any) => Validate<any>>(
        Constructor: C,
        update: (input: InstanceType<C> | nil) => InstanceType<C>,
    ): this {
        if (([Validator, Validate] as unknown[]).includes(Constructor))
            throw new Error(`Must be an extension of ${Validator.name}`)
    
        return this._upsertValidator(
            (i): i is InstanceType<C> => i instanceof Constructor, 
            update as (previous?: Validate<unknown>) => InstanceType<C>
        )
    }

    protected _setValidatorById(
        id: string | symbol,
        update: (previous?: Validate<any>) => Validate<any>
    ): this {
        return this._upsertValidator(
            (v): v is Validate<any> => 'id' in v && v.id === id,
            update
        )
    }

    private _upsertValidator(
        find: TypeGuard<Validate<any>, Validate<any>>,
        update: (previous?: Validate<any>) => Validate<any>
    ): this {

        const newValidators = [...this.validators]

        const oldValidator = pluck(newValidators, find, 1).at(0)

        const newValidator = update(oldValidator)

        return this._copyWithValidators(...newValidators, newValidator)

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
    Schemas
}
