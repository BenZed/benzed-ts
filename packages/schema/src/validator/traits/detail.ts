import { Trait } from '@benzed/traits'
import { isFunc, isShape, isString, isUnion } from '@benzed/util'

import type { Validator } from '../validator'
import { ValidationContext } from '../../validation-context'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main ////

/**
 * Detail trait provides functionality for deriving a custom error detail
 * message out of a validator
 */
abstract class Detail<I = any, O extends I = I> extends Trait {

    static [Trait.onApply](trait: Detail): Detail {
        return trait
    }

    /**
     * Resolve an error message out of a validator
     */
    static resolve<I, O extends I>(
        input: Validator<I,O> | object, 
        ctx: ValidationContext<I, O>, 
        def = 'Validation failed.'
    ): string {

        return this.is(input) 
            ? isFunc(input.detail)
                ? input.detail(ctx.input, ctx)
                : input.detail
            : def
    }

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) => input is Detail<Ix, Ox> = 
        isShape({
            detail: isUnion(isString, isFunc)
        })

    /**
     * Detail or a function returning a detail that describes the error associated with this validation.
     */
    abstract detail: 
    /**/ string | 
    /**/ ((input: I, ctx: ValidationContext<I,O>) => string)
}

//// Exports ////

export default Detail

export {
    Detail
}