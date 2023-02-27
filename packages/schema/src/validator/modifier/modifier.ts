import { Comparable, copy, Copyable, equals } from '@benzed/immutable'
import { Mutate,Trait } from '@benzed/traits'
import { Mutable } from '@benzed/util'

import { ValidateInput, ValidateOptions, ValidateOutput } from '../../validate'
import { ValidationContext } from '../../validation-context'
import { Validator } from '../validator'

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

const Modifier = class extends Trait.add(Validator, Mutate, Copyable, Comparable) {

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
    }

    readonly [Mutate.target]!: Validator

    get [$$type](): ModifierType {
        throw new Error(`${String($$type)} is not implemented in ${this.constructor.name}`)
    }

    [Validator.analyze](ctx: ValidationContext) {
        return this[Mutate.target][Validator.analyze](ctx)
    }

    [Copyable.copy](): this {
        const clone = Copyable.createFromProto(this) as Mutable<this>
        clone[Mutate.target] = copy(this[Mutate.target])
        return clone as this
    }

    [Comparable.equals](other: unknown): other is this {
        return isModifier(other) && 
            equals(
                this[Mutate.target], 
                other[Mutate.target]
            )
    }

} as ModifierConstructor

//// Exports ////

export default Modifier

export {
    Modifier,
    ModifierConstructor
}