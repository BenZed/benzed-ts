import { copy, Copyable } from '@benzed/immutable'
import { Callable, Mutate, Trait } from '@benzed/traits'
import { define, Mutable } from '@benzed/util'

import MutateValidator from './mutate-validator'
import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type LastValidator<T extends Validator[]> = T extends [...any, infer L]
    ? L extends Validator
        ? L 
        : T extends [infer F]
            ? F extends Validator
                ? F
                : never
            : never
    : never

//// Main ////

abstract class MutateLastValidator<V extends Validator[], O> extends MutateValidator<LastValidator<V>, O> {

    readonly validators: V

    constructor(...validators: V) {
        super()
        this.validators = validators
        return Mutate.apply(this as any)
    }

    get [Mutate.target]() {
        return this.validators.at(-1) as LastValidator<V>
    }

    [Copyable.copy](): this {
        const clone = Copyable.createFromProto(this) as Mutable<this>
        clone.validators = copy(this.validators)

        define.hidden(clone, Callable.signature, this[Callable.signature])

        return Trait.apply(clone, Callable, Mutate) as this
    }

}

//// Exports ////

export default MutateLastValidator

export {
    MutateLastValidator,
    LastValidator
}