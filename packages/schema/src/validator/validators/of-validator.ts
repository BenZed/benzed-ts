
import { copy, Copyable } from '@benzed/immutable'
import { Mutate } from '@benzed/traits'
import { define } from '@benzed/util'

import { ValidateInput } from '../../validate'
import ValidationContext from '../../validation-context'
import MutateValidator from '../mutate-validator'
import { Validator } from '../validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type OfValidator<V extends Validator = Validator, O = any> = 
    MutateValidator<ValidateInput<V>, O> & 
    {
        readonly [Mutate.target]: V
        get of(): V
    }

type OfValidatorConstructor = abstract new <V extends Validator, O>(target: V) => OfValidator<V, O>

//// Setup ////

/**
 * A collection data type that contains a sub data type
 */
const OfValidator = class extends MutateValidator<Validator, unknown> {

    [Mutate.target]!: Validator

    constructor(target: Validator) {
        super()
        define.enumerable(this, Mutate.target, target)
        return Mutate.apply(this as any)
    }

    [Copyable.copy](): this {
        const clone = super[Copyable.copy]()
        define.enumerable(clone, Mutate.target, copy(this[Mutate.target]))
        return Mutate.apply(clone as any)
    }

    [Validator.analyze](ctx: ValidationContext): ValidationContext {
        void ctx
        throw new Error(`${this.constructor.name} has not implemented ${String(Validator.analyze)}`)
    }

    get of(): Validator {
        return this[Mutate.target]
    }

} as unknown as OfValidatorConstructor

//// Exports ////

export default OfValidator

export {
    OfValidator
}