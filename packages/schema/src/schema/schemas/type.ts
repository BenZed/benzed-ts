import { isString, nil, pass, resolve } from '@benzed/util'
import { ValidateContext, ValidatorTransform } from '../../validator'
import Schema from '../schema'

interface TypeSettings<T> {}

type Cast = ValidatorTransform<unknown>

class Type<T> extends Schema<unknown, T, TypeSettings<T>> {

}

const $type = new Schema({

    isValid: isString,

    transform(input: unknown, ctx: ValidateContext<unknown>) {
        if (!this.isValid(input) && this.cast)
            input = this.cast(input, ctx)

        if (input === nil && this.default)
            input = this.default(input, ctx)

        return input
    },

    default: nil as ValidatorTransform<unknown> | nil,

    cast: nil as ValidatorTransform<unknown> | nil

})