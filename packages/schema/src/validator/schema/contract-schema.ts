import { isString } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../validate'
import { ValidationErrorMessage } from '../../validation-error'
import { ContractValidator } from '../validators'
import { SubValidators } from './schema'
import SchemaBuilder from './schema-builder'

//// Quick ////

export class ContractSchema<V extends ContractValidator, S extends SubValidators<V>> extends SchemaBuilder<V,S> {

    named(name: string): this {
        return this._applyMainValidator({ name } as V)
    }

    message(error: ValidationErrorMessage<ValidateInput<V>, ValidateOutput<V>>): this {
        const message = isString(error) ? () => error : error 
        return this._applyMainValidator({ message } as V)
    }

}
