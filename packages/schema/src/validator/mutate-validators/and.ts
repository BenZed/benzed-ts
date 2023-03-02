
import { Copyable } from '@benzed/immutable'
import { each, GenericObject, Infer, Intersect, pick } from '@benzed/util'

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

type And<V extends Validator<any, object>[]> = 
    Validator<object, Infer<AndOutput<V>, object>> 
    & _AndProperties<V>

//// Types ////

interface AndConstructor {
    new <V extends Validator<any, object>[]>(...validators: V): And<V>
}

//// Main ////

const And = class IntersectionValidator extends MutateLastValidator<Validator[], unknown> {

    // Construct
    override get name(): string {
        return this.validators.map(v => v.name).join('And')
    }

    [Validator.analyze](ctx: ValidationContext<never, unknown>) {

        const { validators } = this

        const transformed = Copyable.createFromProto(ctx.input) as GenericObject

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
                return vCtx as ValidationContext<never, unknown>

            // apply all properties to transformed if validation
            // succeeded
            for (const [key, value] of each.entryOf(vCtx.getOutput()))
                transformed[key] = value
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
