import { NamesOf } from '@benzed/util'

import { 
    Modifier, 
} from '../modifier'

import {
    AddModifier,
    assertUnmodified,
    HasModifier,
    RemoveModifier,
    ModifierType 
} from '../modifier-operations'

import { ValidateInput } from '../../../validate'
import { ValidationContext } from '../../../validation-context'
import { Validator } from '../../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _NotProperties<V extends Validator> = 
    Modifier<V, ModifierType.Not, ValidateInput<V>> 
    & {
        get not(): V
    }

type _NotInheritKeys<V extends Validator> = 
    Exclude<NamesOf<V>, NamesOf<_NotProperties<V>>>

type _NotWrapBuilderOutput<V extends Validator, P> = P extends V
    ? Not<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Not<V> 
        : P

type _NotInherit<V extends Validator> = {
    [K in _NotInheritKeys<V>]: _NotWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ToggleNot<V extends Validator> =
    HasModifier<V, ModifierType.Not> extends true 
        ? RemoveModifier<V, ModifierType.Not>
        : AddModifier<V, ModifierType.Not>

type Not<V extends Validator> = 
    _NotProperties<V> &
    _NotInherit<V>

interface NotConstructor {
    new <V extends Validator>(validator: V): Not<V>
}

//// Implementation ////

const Not = class extends Modifier<Validator, ModifierType.Not, unknown> {

    //// Construct ////

    constructor(target: Validator) {
        assertUnmodified(target, ModifierType.Not)
        super(target)
    }

    get [Modifier.type](): ModifierType.Not {
        return ModifierType.Not
    }

    //// Not Properties ////
    
    get not(): Validator {
        return this[Modifier.target]
    }

    //// Not Mutation ////

    override [Validator.analyze](ctx: ValidationContext) {

        const notCtx = new ValidationContext(ctx.input, { transform: false, key: ctx.key })
        this[Modifier.target][Validator.analyze](notCtx)

        return notCtx.hasValidOutput()
            ? ctx.setError('not validation failed')
            : ctx.setOutput(ctx.input)
    }

} as unknown as NotConstructor

//// Exports ////

export {
    Not,
    ToggleNot
}