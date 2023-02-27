import { Mutate, Trait } from '@benzed/traits'
import { each } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../validate'
import { ValidationContext } from '../../validation-context'
import { Validator } from '../validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// HelperTypes ////

// type FirstValidator<T extends Validator[]> = T extends [infer F, ...any]
//     ? F extends Validator
//         ? F 
//         : never
//     : never

type TargetValidator<T extends Validator[]> = T extends [...any, infer L]
    ? L extends Validator
        ? L 
        : T extends [infer F]
            ? F extends Validator
                ? F
                : never
            : never
    : never

type _UnionValidatorWrapBuilderOutput<V extends Validator[], P> = 
    P extends TargetValidator<V>
        ? UnionValidator<V>
        : P extends (...args: infer A) => TargetValidator<V>
            ? (...args: A) => UnionValidator<V> 
            : P

type _UnionValidatorProperties<V extends Validator[]> = {
    [K in keyof TargetValidator<V>]: _UnionValidatorWrapBuilderOutput<V, TargetValidator<V>[K]>
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

const UnionValidator = class UnionValidator extends Trait.add(Validator, Mutate<Validator>) {

    // Construct

    readonly validators: Validator[]

    constructor(...validators: Validator[]) {
        super()
        this.validators = validators
    }

    get [Mutate.target]() {
        return this.validators.at(-1) as Validator
    }

    // Validate
    [Validator.analyze](ctx: ValidationContext): ValidationContext {
        
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
    UnionValidator
}
