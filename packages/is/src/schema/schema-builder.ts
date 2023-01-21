import { isString, isSymbol, Pipe, OutputOf } from '@benzed/util'

import Schema from './schema'

import {

    Validate,
    ValidatorSettings, 
    ValidationErrorMessage, 

    Validator, 
    ValidatorTypeGuard,
    ValidatorTransform,
    ValidatorPredicate,
    AnyValidate

} from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type SchemaBuilders<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    ? [SchemaBuilder<T1>, ...SchemaBuilders<Tr>]
    : []

class SchemaBuilder<T = unknown> extends Schema<T> implements Iterable<AnyValidate> {

    validates(
        ...input: (Validate<T> | Partial<ValidatorSettings<T>>)[]
    ): this {
        const validate = Validator.from(...input) as Validate<OutputOf<this>>
        return 'id' in validate && (isString(validate.id) || isSymbol(validate.id))
            ? Schema.upsert(this, () => validate as AnyValidate, validate.id)
            : Schema.merge(this, validate)
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

    //// Main ////
    
    get validators(): AnyValidate[] {
        return Array.from(this)
    }
    
    *[Symbol.iterator](): IterableIterator<AnyValidate> {

        const validators: Iterable<AnyValidate> = this.validate instanceof Pipe 
            ? this.validate as Pipe 
            : [this.validate]

        for (const validator of validators)
            yield validator
    }
}

//// Exports ////

export default SchemaBuilder

export {
    SchemaBuilder,
    SchemaBuilders
}
