import { Trait } from '@benzed/traits'
import { AnyTypeGuard, isFunc, isIntersection, isShape, nil } from '@benzed/util'

import ValidationContext from '../../validation-context'
import { Validator } from '../validator'
import Assert from './assert'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

/**
 * The transform trait provides functionality for transforming a
 * validation input into it's desired output.
 */
abstract class Transform<I = any, O extends I = I> extends Trait {

    /**
     * Given a validator and a validation context, apply any transformations 
     * on the validator to the context.
     * 
     * Receive the expected output of the transformation, considering 
     * the state of the context's transform option.
     */
    static transform<Ix, Ox extends Ix>(validator: Validator<Ix,Ox> | object, ctx: ValidationContext<Ix,Ox>): Ix | Ox {

        ctx.transformed = this.is<Ix,Ox>(validator) 
            ? validator.transform(ctx.input, ctx) 
            : ctx.input

        return ctx.transform ? ctx.transformed : ctx.input
    }

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) => input is Transform<Ix, Ox> = 
        isShape({
            transform: isFunc 
        })

    abstract transform(input: I, ctx: ValidationContext<I,O>): I | O

}

abstract class DefaultCastTransform<I = any, O extends I = I> extends Transform<I, O> {

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) => input is Transform<Ix,Ox> = isIntersection(
        Transform.is,
        isShape({
            cast: isFunc,
            default: isFunc
        })
    ) as AnyTypeGuard

    transform(input: I, ctx: ValidationContext<I, O>): I | O {

        if (input === nil)
            input = this.default(ctx)

        if (!Assert.isValid(this, ctx, input))
            input = this.cast(input, ctx)

        return input
    }

    /**
     * If the given input is not valid, the cast method
     * may be overridden to attempt to convert it.
     * This is the classic responsibility of the transform 
     * method, but in a type validator it's been
     * split into two parts to make it easy to customize
     */
    abstract cast(input: I, ctx: ValidationContext<I,O>): I | O

    /**
     * If the given input is undefined, the default 
     * method can be overridden to provide 
     */
    abstract default(ctx: ValidationContext<I,O>): I | O

}

//// Exports ////

export default Transform

export {
    Transform,
    DefaultCastTransform
}