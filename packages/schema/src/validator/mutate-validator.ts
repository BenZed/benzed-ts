import { Comparable, Copyable, equals } from '@benzed/immutable'
import { Callable, Mutate,Trait } from '@benzed/traits'
import { isFunc } from '@benzed/util'
import { ValidateImmutable } from '../traits'

import { ValidateInput, ValidateOptions } from '../validate'
import { ValidationContext } from '../validation-context'
import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

interface MutateValidator<
    V extends Validator,
    O
> extends Mutate<V> {

    (input: ValidateInput<V>, options?: ValidateOptions): O

    [Validator.analyze](
        ctx: ValidationContext<ValidateInput<V>, O>
    ): ValidationContext<ValidateInput<V>, O>

    [Copyable.copy](): this 

    [Comparable.equals](other: unknown): other is this

    [Callable.signature](input: ValidateInput<V>, options?: ValidateOptions): O
    readonly [Callable.context]: unknown

}

type MutateValidatorConstructor = abstract new<
    V extends Validator,
    O
>() => MutateValidator<V, O>

//// Main ////

const MutateValidator = class extends Trait.add(Validator, Mutate, ValidateImmutable) { 

    get [Mutate.target](): Validator {
        throw new Error(`${this.constructor.name} does not implement ${String(Mutate.target)}`)
    }

    [Validator.analyze](ctx: ValidationContext) {
        return this[Mutate.target][Validator.analyze](ctx)
    }

    [Comparable.equals](other: unknown): other is this {
        return isFunc(other) && Mutate.is(other) && 
            equals(
                this[Mutate.target], 
                other[Mutate.target]
            )
    }

} as MutateValidatorConstructor

// HACK
delete MutateValidator.prototype[Mutate.target]

//// Exports ////

export default MutateValidator

export {
    MutateValidator
}