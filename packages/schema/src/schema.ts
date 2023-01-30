
import AbstractSchema from './abstract-schema'

import {
    Validate, 

    ValidatorPredicate, 
    ValidatorSettings, 
    ValidatorTransform, 
    ValidatorTypeGuard,

    NameErrorIdSignature,
    toNameErrorId, 
} from './validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Validators ////

type AnySchema = Schema<any,any>

//// Schema ////

class Schema<I, O = I> extends AbstractSchema<I,O> {
    
    validates(
        input: Partial<ValidatorSettings<O,O>> | Validate<O>,
        id?: symbol
    ): this {
        return this._upsertValidator(input, id)
    }

    asserts(
        isValid: ValidatorPredicate<O>,
        ...args: NameErrorIdSignature<I>
    ): this {
        return this._upsertValidator({
            ...toNameErrorId(...args),
            isValid: isValid as O extends O 
                ? ValidatorPredicate<O> | ValidatorTypeGuard<O, O> 
                : ValidatorPredicate<O>,
        })
    }

    transforms(
        transform: ValidatorTransform<O>,
        ...args: NameErrorIdSignature<I>
    ): this {
        return this._upsertValidator({
            ...toNameErrorId(...args),
            transform
        })
    }

    remove(
        id: symbol
    ): this {
        return this._removeValidator(id)
    }

}

//// Exports ////

export default Schema 

export { 
    Schema,
    AnySchema,
} 