import { isString, isSymbol, nil, Pipe, TypeGuard } from '@benzed/util'
import { pluck } from '@benzed/array'

import {

    Validate,
    ValidatorSettings, 
    ValidationErrorMessage, 

    Validator, 
    ValidatorTypeGuard,
    ValidatorTransform,
    ValidatorPredicate

} from '../validator'

import ToUnion from './schematic'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Schemas<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    ? [Schema<T1>, ...Schemas<Tr>]
    : []

/**
 * @internal
 */
type AnySchema = Schema<any>

class Schema<T = unknown> extends ToUnion<T> 
    implements Iterable<Validate<unknown>> {
    
    //// Main ////
    
    get validators(): Validate<unknown>[] {
        return Array.from(this) 
    }

    validates(
        ...input: (Validate<T> | Partial<ValidatorSettings<T>>)[]
    ): this {

        const validate = Validator.from(...input)

        return 'id' in validate && (isString(validate.id) || isSymbol(validate.id))
            ? this._setValidatorById(validate.id, () => validate)
            : this._addValidator(validate)
    }

    asserts(
        isValid: ValidatorTypeGuard<T> | ValidatorPredicate<T>, 
        error?: string | ValidationErrorMessage<T>,
        id?: string | symbol
    ): this {
        return this.validates({ 
            is: isValid, 
            error, 
            id 
        })
    }

    transforms(
        transform: ValidatorTransform<T>,
        error?: string | ValidationErrorMessage<T>,
        id?: string | symbol
    ): this {
        return this.validates({ 
            transform, 
            error, 
            id 
        })
    }

    //// Helper ////

    protected _copyWithValidators(...validators: Validate<unknown>[]): this {
        const schema = this.copy()
        return Object.assign(schema, { validate: Validator.from(...validators) })
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
        if (([Validator] as [unknown]).includes(Constructor))
            throw new Error(`Must be an extension of ${Validator.name}`)
    
        return this._upsertValidator(
            (i): i is InstanceType<C> => i instanceof Constructor, 
            update as (previous?: Validate<unknown>) => InstanceType<C>
        )
    }

    protected _setValidatorById(
        id: string | symbol,
        update: nil | ((previous?: Validate<any>) => Validate<any>)
    ): this {
        return this._upsertValidator(
            (v): v is Validate<any> => 'id' in v && v.id === id,
            update
        )
    }

    private _upsertValidator(
        find: TypeGuard<Validate<any>, Validate<any>>,
        update?: (previous?: Validate<any>) => Validate<any>
    ): this {

        const newValidators = [...this.validators]

        const oldValidator = pluck(newValidators, find, 1).at(0)

        const newValidator = update?.(oldValidator)
        if (newValidator)
            newValidators.push(newValidator)

        return this._copyWithValidators(...newValidators)
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
    Schemas,
    AnySchema
}
