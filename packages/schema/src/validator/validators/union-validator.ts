import { each } from '@benzed/util'

import { Validator } from '../validator'
import { ValidationContext } from '../../validation-context'
import { ValidateInput, ValidateOutput } from '../../validate'
import { MutateLastValidator, LastValidator } from '../mutate-last-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// HelperTypes ////

type _UnionValidatorWrapBuilderOutput<V extends Validator[], P> = 
    P extends LastValidator<V>
        ? UnionValidator<V>
        : P extends (...args: infer A) => LastValidator<V>
            ? (...args: A) => UnionValidator<V> 
            : P

type _UnionValidatorProperties<V extends Validator[]> = {
    [K in keyof LastValidator<V>]: _UnionValidatorWrapBuilderOutput<V, LastValidator<V>[K]>
} & {
    readonly validators: V
}

//// Types ////

type UnionValidatorInput<V extends Validator[]> = ValidateInput<V[number]>

type UnionValidatorOutput<V extends Validator[]> = 
    ValidateOutput<V[number]> extends UnionValidatorInput<V>
        ? ValidateOutput<V[number]>
        : never

type UnionValidator<V extends Validator[]> = 
    Validator<ValidateInput<V[number]>, UnionValidatorOutput<V>> 
    & _UnionValidatorProperties<V>

interface UnionValidatorConstructor {
    new <V extends Validator[]>(...validators: V): UnionValidator<V>
}

//// Main ////

const UnionValidator = class UnionValidator extends MutateLastValidator<Validator[], unknown> {

    override get name(): string {
        return this.validators.map(v => v.name).join('Or')
    }

    [Validator.analyze](ctx: ValidationContext<never, unknown>): ValidationContext<never, unknown> {

        for (const index of each.indexOf(this.validators)) {

            const validator = this.validators[index]

            const subCtx = validator[Validator.analyze](ctx.pushSubContext(
                ctx.input,
                index
            ))

            if (subCtx.hasValidOutput()) {
                ctx.clearSubContexts()
                return ctx.setOutput(subCtx.getOutput())
            }
        }

        return ctx
    }

} as unknown as UnionValidatorConstructor

//// Exports ////

export default UnionValidator

export {
    UnionValidator,
    MutateLastValidator
}
