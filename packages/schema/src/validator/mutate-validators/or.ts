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

type _OrWrapBuilderOutput<V extends Validator[], P> = 
    P extends LastValidator<V>
        ? Or<V>
        : P extends (...args: infer A) => LastValidator<V>
            ? (...args: A) => Or<V> 
            : P

type _OrProperties<V extends Validator[]> = {
    [K in keyof LastValidator<V>]: _OrWrapBuilderOutput<V, LastValidator<V>[K]>
} & {
    readonly validators: V
}

//// Types ////

type OrInput<V extends Validator[]> = ValidateInput<V[number]>

type OrOutput<V extends Validator[]> = 
    ValidateOutput<V[number]> extends OrInput<V>
        ? ValidateOutput<V[number]>
        : never

type Or<V extends Validator[]> = 
    Validator<ValidateInput<V[number]>, OrOutput<V>> 
    & _OrProperties<V>

interface OrConstructor {
    new <V extends Validator[]>(...validators: V): Or<V>
}

//// Main ////

const Or = class Or extends MutateLastValidator<Validator[], unknown> {

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

} as unknown as OrConstructor

//// Exports ////

export default Or

export { Or }
