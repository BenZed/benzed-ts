
import { Copyable } from '@benzed/immutable'
import { each, Infer, Intersect, pick } from '@benzed/util'

import { ValidateOutput } from '../../validate'
import { ValidationContext } from '../../validation-context'
import { Validator } from '../validator'
import ShapeValidator from './shape-validator'
import { MutateLastValidator } from './union-validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// HelperTypes ////

type _IntersectionValidatorWrapBuilderOutput<V extends Validator[], P> = 
    P extends V
        ? IntersectionValidator<V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => IntersectionValidator<V> 
            : P

type _IntersectionValidatorProperties<V extends Validator[]> = {
    [K in keyof V]: _IntersectionValidatorWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ValidateArrayOutput<T extends Validator[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Validator
        ? Tr extends Validator[]
            ? [ValidateOutput<T1>, ...ValidateArrayOutput<Tr>]
            : [ValidateOutput<T1>]
        : []
    : []

type IntersectionValidatorOutput<V extends Validator[]> = Intersect<ValidateArrayOutput<V>>

type IntersectionValidator<V extends Validator<object>[]> = 
    Validator<object, Infer<IntersectionValidatorOutput<V>, object>> 
    & _IntersectionValidatorProperties<V>

//// Types ////

interface IntersectionValidatorConstructor {
    new <V extends Validator<object>[]>(...validators: V): IntersectionValidator<V>
}

//// Main ////

const IntersectionValidator = class IntersectionValidator extends MutateLastValidator {

    // Construct

    override get name(): string {
        return this.validators.map(v => v.name).join('And')
    }

    [Validator.analyze](ctx: ValidationContext): ValidationContext {

        const { validators } = this

        const transformed = Copyable.createFromProto(ctx.input)

        for (const index of each.indexOf(validators)) {
            const validator = validators[index]

            // I don't like this, but, since the intersection validator
            // can only be used with object types, it seems pretty safe.
            const input = validator instanceof ShapeValidator 
                ? pick(ctx.input, ...each.keyOf(validator.properties))
                : ctx.input

            // validate object with narrowed input
            const vCtx = validator[Validator.analyze](
                new ValidationContext(input, {
                    transform: ctx.transform
                })
            )

            if (!vCtx.hasValidOutput())
                return vCtx

            // apply all properties to transformed if validation
            // succeeded
            for (const [key, value] of each.entryOf(vCtx.getOutput()))
                transformed[key] = value
        }

        ctx.transformed = transformed

        return ctx.setOutput(transformed)
    }

} as unknown as IntersectionValidatorConstructor

//// Exports ////

export default IntersectionValidator

export {
    IntersectionValidator
}
