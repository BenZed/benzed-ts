
import { copy } from '@benzed/immutable'
import { each, Infer, Intersect, pick } from '@benzed/util'

import { ValidateOutput } from '../../validate'
import { ValidationContext } from '../../validation-context'
import MutateLastValidator from '../mutate-last-validator'

import { Validator } from '../validator'
import { ShapeValidator } from '../validators/shape-validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// HelperTypes ////

type _AndWrapBuilderOutput<V extends Validator[], P> = 
    P extends V
        ? And<V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => And<V> 
            : P

type _AndProperties<V extends Validator[]> = {
    [K in keyof V]: _AndWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ValidateArrayOutput<T extends Validator[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Validator
        ? Tr extends Validator[]
            ? [ValidateOutput<T1>, ...ValidateArrayOutput<Tr>]
            : [ValidateOutput<T1>]
        : []
    : []

type AndOutput<V extends Validator[]> = Intersect<ValidateArrayOutput<V>>

type And<V extends Validator[]> = 
    Validator<object, Infer<AndOutput<V>, object>> 
    & _AndProperties<V>

//// Types ////

interface AndConstructor {
    new <V extends Validator[]>(...validators: V): And<V>
}

//// Main ////

const And = class IntersectionValidator extends MutateLastValidator<Validator[], unknown> {

    // Construct
    override get name(): string {
        return this.validators.map(v => v.name).join('And')
    }

    [Validator.analyze](ctx: ValidationContext<never, unknown>) {

        const { validators } = this

        let transformed = ctx.transformed = copy(ctx.input)

        for (const index of each.indexOf(validators)) {
            const validator = validators[index]

            // validate object with narrowed input
            const vCtx = validator[Validator.analyze](
                new ValidationContext(transformed, {
                    transform: ctx.transform,
                    key: ctx.key
                })
            )

            if (!vCtx.hasValidOutput())
                return vCtx as ValidationContext<never, unknown>

            transformed = vCtx.getOutput() as never
        }

        ctx.transformed = transformed

        return ctx.setOutput(transformed)
    }

} as unknown as AndConstructor

//// Exports ////

export default And

export {
    And
}
