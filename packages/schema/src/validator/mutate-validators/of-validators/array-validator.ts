import { each, isArray } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../../validate'
import { ValidationContext } from '../../../validation-context'
import { Validator } from '../../validator'

import Of from '../of' 

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

type _ArrayValidatorDynamic<V extends Validator> = {
    [K in keyof V as K extends keyof Of ? never : K]: _ArrayValidatorWrapBuilderOutput<V, V[K]>
}

interface _ArrayValidatorStatic<V extends Validator> {
    [Validator.analyze](ctx: ValidationContext<ValidateInput<V>, ValidateOutput<V>[]>): ValidationContext<ValidateInput<V>, ValidateOutput<V>[]>
}

//// Types ////

type ArrayValidator<V extends Validator> = 
    Of<V, ValidateOutput<V>[]> 
    & _ArrayValidatorDynamic<V>
    & _ArrayValidatorStatic<V>

interface ArrayValidatorConstructor {
    new <V extends Validator>(validator: V): ArrayValidator<V>
}
 
//// Main ////

const ArrayValidator = class <V extends Validator> extends Of<V, ValidateOutput<V>[]> {

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