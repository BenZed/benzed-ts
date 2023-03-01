import { copy, Copyable, Stateful } from '@benzed/immutable'
import { Callable, Mutate, Trait } from '@benzed/traits'
import { define } from '@benzed/util'

import { ValidateInput, ValidateOptions, ValidateOutput } from '../../validate'
import { ValidationContext } from '../../validation-context'
import { Validator } from '../validator'
import MutateValidator from '../mutate-validator'

import {

    $$type,
    addModifiers,
    eachModifier,
    ensureModifier,
    getModifiers,
    hasModifier,
    isModifier,
    ModifierType,
    removeAllModifiers,
    removeModifier

} from './modifier-operations'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

declare abstract class Modifiable<T extends ModifierType> {

    abstract get [$$type](): T

}

interface Modifier<
    V extends Validator = Validator,
    T extends ModifierType = any,
    O = ModifierOutput<V>
> extends Modifiable<T> {

    (input: ValidateInput<V>, options?: ValidateOptions): O

    [Validator.analyze](
        ctx: ValidationContext<ValidateInput<V>, O>
    ): ValidationContext<ValidateInput<V>, O>

    readonly [Mutate.target]: V
}

type ModifierOutput<V extends Validator> = ValidateOutput<V> extends ValidateInput<V> 
    ? ValidateOutput<V>
    : never

type ModifierAbstractConstructor = abstract new<
    V extends Validator,
    T extends ModifierType,
    O extends ValidateInput<V> = ModifierOutput<V>
>(validator: V) => Modifier<V, T, O>

interface ModifierConstructor extends ModifierAbstractConstructor {
    readonly target: typeof Mutate.target
    readonly type: typeof $$type

    readonly add: typeof addModifiers
    readonly has: typeof hasModifier
    readonly ensure: typeof ensureModifier
    readonly remove: typeof removeModifier
    readonly removeAll: typeof removeAllModifiers
    readonly each: typeof eachModifier
    readonly get: typeof getModifiers
    readonly is: typeof isModifier
}

//// Main ////

const Modifier = class extends MutateValidator<Validator, any> {

    static readonly target = Mutate.target
    static readonly type = $$type

    static readonly add = addModifiers
    static readonly has = hasModifier
    static readonly ensure = ensureModifier
    static readonly remove = removeModifier
    static readonly removeAll = removeAllModifiers
    static readonly each = eachModifier
    static readonly get = getModifiers
    static readonly is = isModifier

    constructor(validator: Validator) {
        super()
        this[Mutate.target] = validator
        return Mutate.apply(this as any)
    }

    readonly [Mutate.target]!: Validator

    get [$$type](): ModifierType {
        throw new Error(`${String($$type)} is not implemented in ${this.constructor.name}`)
    }

    [Validator.copy](): this {
        const clone = Copyable.createFromProto(this)
        define.enumerable(clone, Mutate.target, copy(this[Mutate.target]))
        return Trait.apply(clone, Callable, Mutate)
    }

    [Validator.analyze](ctx: ValidationContext) {
        return this[Mutate.target][Validator.analyze](ctx)
    }

    get [Validator.state]() {
        return this[Mutate.target][Validator.state]
    }

    set [Validator.state](state) {
        Stateful.set(this[Mutate.target], state)
    }

} as ModifierConstructor

//// Exports ////

export default Modifier

export {
    Modifier,
    ModifierConstructor
}