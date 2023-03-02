
import { define, nil, pick } from '@benzed/util'

import ValidationContext from '../../../validation-context'
import { Validator } from '../../validator'
import ContractValidator from '../contract-validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

abstract class TypeValidator<T = any> extends ContractValidator<unknown, T> {

    abstract override isValid(input: unknown, ctx: ValidationContext<unknown, T>): input is T

    default?(ctx: ValidationContext<unknown, T>): T

    cast?(input: unknown, ctx: ValidationContext<unknown, T>): unknown

    override transform(input: unknown, ctx: ValidationContext<unknown, T>): unknown {

        if (this.default && input === nil)
            input = this.default(ctx)

        if (this.cast && !this.isValid(input, ctx))
            input = this.cast(input, ctx)

        return input
    }

    //// Validator ////

    get [Validator.state](): Pick<this, 'name' | 'message' | 'cast' | 'default'> {
        return pick(this, 'name', 'message', 'cast', 'default')
    }

    set [Validator.state](state: Pick<this, 'name' | 'message' | 'cast' | 'default'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.hidden(this, 'cast', state.cast)
        define.hidden(this, 'default', state.default)
    }

}

//// Exports ////

export default TypeValidator 

export {
    TypeValidator
}