import { NamesOf } from '@benzed/util'

import { Modifier } from '../modifier'
import { assertUnmodified, RemoveModifier, ModifierType } from '../modifier-operations'
import { Validator } from '../../validator'
import { ValidateOutput } from '../../../validate'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _ReadOnlyProperties<V extends Validator> = 
    Modifier<V, ModifierType.ReadOnly, Readonly<ValidateOutput<V>>> 
    & {
        get writable(): V
    }

type _ReadOnlyInheritKeys<V extends Validator> = 
    Exclude<NamesOf<V>, NamesOf<_ReadOnlyProperties<V>>>

type _ReadOnlyWrapBuilderOutput<V extends Validator, P> = P extends V
    ? ReadOnly<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => ReadOnly<V> 
        : P

type _ReadOnlyInherit<V extends Validator> = {
    [K in _ReadOnlyInheritKeys<V>]: _ReadOnlyWrapBuilderOutput<V, V[K]>
}

//// Types ////

type Writable<V extends Validator> =
    RemoveModifier<V, ModifierType.ReadOnly>

type ReadOnly<V extends Validator> = 
    _ReadOnlyProperties<V> &
    _ReadOnlyInherit<V>

interface ReadOnlyConstructor {
    new <V extends Validator>(validator: V): ReadOnly<V>
}

//// Implementation ////  

const ReadOnly = class extends Modifier<Validator, ModifierType.ReadOnly, unknown> {

    constructor(target: Validator) {
        assertUnmodified(target, ModifierType.ReadOnly)
        super(target)
    }

    get [Modifier.type](): ModifierType.ReadOnly {
        return ModifierType.ReadOnly
    }

    get writable(): Validator {
        return this[Modifier.target]
    }

} as unknown as ReadOnlyConstructor

//// Exports ////

export {
    ReadOnly,
    Writable
}