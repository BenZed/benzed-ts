import { Stateful } from '@benzed/immutable'
import { Mutate, Trait } from '@benzed/traits'

import { ValidateInput } from '../validate'
import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

interface MutateValidator<
    V extends Validator,
    O
> extends Validator<ValidateInput<V>, O>, Mutate<V> {}

type MutateValidatorConstructor = abstract new<
    V extends Validator,
    O
>() => MutateValidator<V, O>

//// Main ////

abstract class MutateValidatorAbstract extends Trait.add(Validator, Mutate) { 

    [Validator.copy](): this {
        const clone = super[Validator.copy]()
        return Mutate.apply(clone)
    }

}

const MutateValidator = MutateValidatorAbstract as MutateValidatorConstructor

//// Exports ////

export default MutateValidator

export {
    MutateValidator
}