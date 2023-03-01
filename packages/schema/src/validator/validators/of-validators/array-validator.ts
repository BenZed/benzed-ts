import { each, isArray } from '@benzed/util'

import { ValidateOutput } from '../../../validate'
import { ValidationContext } from '../../../validation-context'
import { Validator } from '../../validator'

import OfValidator from '../of-validator' 

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// HelperTypes ////

type _ArrayValidatorWrapBuilderOutput<V extends Validator, P> = 
    P extends V
        ? ArrayValidator<V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => ArrayValidator<V> 
            : P

type _ArrayValidatorProperties<V extends Validator> = {
    [K in keyof V as K extends keyof OfValidator ? never : K]: _ArrayValidatorWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ArrayValidator<V extends Validator> = 
    OfValidator<V, ValidateOutput<V>[]> 
    & _ArrayValidatorProperties<V>

interface ArrayValidatorConstructor {
    new <V extends Validator>(validator: V): ArrayValidator<V>
}

//// Main ////

const ArrayValidator = class <V extends Validator> extends OfValidator<V, ValidateOutput<V>[]> {

    [Validator.analyze](ctx: ValidationContext): ValidationContext {

        if (!isArray(ctx.input)) 
            return ctx.setError('must be an array')

        const transformed: unknown[] = []

        for (const index of each.indexOf(ctx.input)) {
            const indexCtx = this.of[Validator.analyze](ctx.pushSubContext(ctx.input[index], index))
            if (!indexCtx.hasValidOutput())
                return ctx

            transformed[index] = indexCtx.getOutput()
        }

        ctx.transformed = transformed 
        return ctx.setOutput(transformed)
    }

} as unknown as ArrayValidatorConstructor

//// Exports ////

export default ArrayValidator

export {
    ArrayValidator
}