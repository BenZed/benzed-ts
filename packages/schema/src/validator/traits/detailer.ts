import { Trait } from '@benzed/traits'
import { AnyTypeGuard, isFunc, isKeyed } from '@benzed/util'

import type { Validator } from '../validator'
import { ValidationContext } from '../../validation-context'
import { ValidationErrorDetail } from '../../validation-error'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

/**
 * Detailer trait provides functionality for deriving a custom error detail
 * message out of a validator
 */
abstract class Detailer<I = any, O extends I = I> extends Trait {

    static [Trait.onApply](trait: Detailer): Detailer {
        return trait
    }

    /**
     * Resolve an error message out of a validator
     */
    static resolve<I, O extends I>(
        input: Validator<I,O> | object, 
        ctx: ValidationContext<I, O>, 
        def = 'Validation failed.'
    ): ValidationErrorDetail<I> {

        return this.is(input) 
            ? isFunc(input.detail)
                ? input.detail(ctx.input, ctx)
                : input.detail
            : def
    }

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) => input is Detailer<Ix, Ox> = 
        isKeyed('detail') as AnyTypeGuard

    /**
     * Detail or a function returning a detail that describes the error associated with this validation.
     */
    abstract detail: 
    /**/ ValidationErrorDetail<I> | 
    /**/ ((input: I, ctx: ValidationContext<I,O>) => ValidationErrorDetail<I>)
}

//// Exports ////

export default Detailer

export {
    Detailer
}