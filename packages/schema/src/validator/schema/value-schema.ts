import { Primitive } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../validate'
import { ValidationErrorMessage } from '../../validation-error'
import { ValueValidator } from '../validators'
import Schema from './schema'

//// Quick ////

export class ValueSchema<V extends ValueValidator<Primitive>> extends Schema<V,{}> {

    named(name: string): this {
        return this._applyMainValidator({ name } as V)
    }

    force(force: boolean): this {
        return this._applyMainValidator({ force } as V)
    }

    message(message: ValidationErrorMessage<ValidateInput<V>, ValidateOutput<V>>): this {
        return this._applyMainValidator({ message } as V)
    }

}
