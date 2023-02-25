
import { nil } from '@benzed/util'

import ValidationContext from '../validation-context'
import Validator from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

abstract class TypeValidator<T> extends Validator<unknown, T> {
    
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

}

//// Exports ////

export default TypeValidator 

export {
    TypeValidator
}