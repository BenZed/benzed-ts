import { nil } from '@benzed/util'

import { ValidateInput, ValidateOutput } from '../../../validate'
import ValidationContext from '../../../validation-context'
import { Validator } from '../../validator'

import { Modifier } from '../modifier'

import {
    assertUnmodified,
    RemoveModifier,
    ModifierType
} from '../modifier-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _OptionalProperties<V extends Validator> = 
    Modifier<V, ModifierType.Optional, ValidateOutput<V> | nil> 
    & {
        get required(): V
    }

type _OptionalInheritKeys<V extends Validator> = 
    Exclude<keyof V, keyof _OptionalProperties<V>>

type _OptionalWrapBuilderOutput<V extends Validator, P> = P extends V
    ? Optional<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Optional<V> 
        : P

type _OptionalInherit<V extends Validator> = {
    [K in _OptionalInheritKeys<V>]: _OptionalWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Required<V extends Validator> = RemoveModifier<V, ModifierType.Optional>

type Optional<V extends Validator> = 
    _OptionalProperties<V> &
    _OptionalInherit<V> & 
    Validator<ValidateInput<V>, ValidateOutput<V> | nil>

interface OptionalConstructor {
    new <V extends Validator>(validator: V): Optional<V>
}

//// Implementation ////
const Optional = class Optional extends Modifier<Validator, ModifierType.Optional, unknown> {

    //// Constructor ////

    constructor(target: Validator) {
        assertUnmodified(target, ModifierType.Optional)
        super(target)
    }

    get [Modifier.type](): ModifierType.Optional {
        return ModifierType.Optional
    }

    override [Validator.analyze](ctx: ValidationContext) {
        ctx = this[Modifier.target][Validator.analyze](ctx)

        return ctx.hasError() && !ctx.hasSubContextError() && ctx.input === undefined
            ? ctx.setOutput(undefined)
            : ctx
    }

    //// Convenience ////

    get required(): Validator {
        return Modifier.remove(
            this[Modifier.target],
            ModifierType.Optional
        )
    }

} as unknown as OptionalConstructor

//// Exports ////

export default Optional

export {
    Optional,
    Required
}