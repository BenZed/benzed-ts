
import { ValidateInput, ValidateOutput } from '../../validate'
import { ValidationErrorMessage } from '../../validation-error'
import { Validator } from '../validator'
import { ContractValidator } from '../validators'
import { SubValidators } from './schema'
import SchemaBuilder from './schema-builder'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type NameValidator<I = any, O = I> = Validator<I,O> & {
    readonly name: ContractValidator<I,O>['name']
}

type NameMessageValidator<I = any, O = I> = NameValidator<I,O> & {
    readonly message: ContractValidator<I,O>['message']
}

//// Quick ////

export class NameSchema<V extends NameValidator, S extends SubValidators<V>> extends SchemaBuilder<V,S> {

    named(name: string): this {
        return this._applyMainValidator({ name } as V)
    }

}

export class ContractSchema<V extends NameMessageValidator, S extends SubValidators<V>> extends NameSchema<V,S> {

    message(message: ValidationErrorMessage<ValidateInput<V>, ValidateOutput<V>>): this {
        return this._applyMainValidator({ message } as V)
    }

}
