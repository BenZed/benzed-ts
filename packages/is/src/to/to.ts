
import { Method } from '@benzed/traits'

import {
    AddModifiers,
    HasModifier,
    Modifier,
    ModifierType,
    RemoveModifier,
    Validator
} from '@benzed/schema'

import { pluck } from '@benzed/array'

import { Is } from '../is'

import {
    String,
    Boolean,
    Number,
    $string,
    $boolean,
    $number,
} from '../schemas'

import {
    ResolveShapeValidatorInput,
    resolveValidator, 
    ResolveValidator,
    ResolveValidatorsInput 
} from './resolve-validator'

//// TODO ////

// This module works, but it needs a BIG ol fashion clean up

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

//// Types ////

export enum OfType {
    Record = 'Record',
    Array = 'Array',
    // Set = 'Set',
    // Map = 'Map'
}

type From = [Validator] | []

interface ToSignature<F extends From, C extends ModifierType[]> {
    <T extends ResolveValidatorsInput>(...inputs: T): IsTo<F, C, T>
}

type IsTo<F extends From, M extends ModifierType[], T extends ResolveValidatorsInput> = 
    
    F extends [Validator]

        // Hoist Not modifier to the base
        ? HasModifier<F[0], ModifierType.Not> extends true
            ? Is<AddModifiers<ResolveValidator<[RemoveModifier<F[0], ModifierType.Not>, ...T]>, [ModifierType.Not, ...M]>>
            : Is<AddModifiers<ResolveValidator<[F[0], ...T]>, M>>

        : T extends [] 
            ? To<F, M>
            : Is<AddModifiers<ResolveValidator<T>, M>>

//// Main ////

/**
 * Class for handling the chaining of validators together
 */
class To<F extends From, M extends ModifierType[]> extends Method<ToSignature<F,M>> {

    /**
     * @internal
     */
    readonly _from: F
    
    /**
     * @internal
     */
    readonly _modifiers: M

    // readonly _of: OfType[]

    constructor(...args: [...F, ...M]) {
        super(to)
        this._from = pluck(args, Validator.is) as F
        this._modifiers = args as unknown as M
    }

    private _addModifier<Mx extends ModifierType>(m: Mx): IsTo<F, [...M, Mx], []> {
        const args: any[] = [...this._from, ...this._modifiers, m]
        return new To(...args)() as any
    }

    get optional(): IsTo<F, [...M, ModifierType.Optional], []> {
        return this._addModifier(ModifierType.Optional)
    }

    get readonly(): IsTo<F, [...M, ModifierType.ReadOnly], []> {
        return this._addModifier(ModifierType.ReadOnly)
    }

    get not(): IsTo<F, [...M, ModifierType.Not], []> {
        return this._addModifier(ModifierType.Not)
    }

    get string(): IsTo<F, M, [String]> {
        return this($string) as any
    }

    get boolean(): IsTo<F, M, [Boolean]> {
        return this($boolean) as any
    }

    get number(): IsTo<F, M, [Number]> {
        return this($number) as any
    }

    shape<T extends ResolveShapeValidatorInput>(
        shape: T
    ): IsTo<F, M, [ResolveValidator<[T]>]> {
        return this(resolveValidator(shape)) as any
    }
}

//// Helper ////

function to<T extends ResolveValidatorsInput, F extends From, M extends ModifierType[]>(
    this: To<F,M>,
    ...inputs: T
): IsTo<F, M, ResolveValidator<T>> {

    type Return = IsTo<F, M, ResolveValidator<T>>

    const modifiers = [...this._modifiers]

    // Handle redirect to To
    let [ from ] = this._from
    if (!from && inputs.length === 0)
        return new To(...modifiers) as Return

    // Handle Not Modifier Hoisting
    if (from && Modifier.has(from, ModifierType.Not)) {
        from = Modifier.remove(from, ModifierType.Not)
        modifiers.unshift(ModifierType.Not)
    } else if (from)
        inputs.unshift(from)

    // Create Validator
    const validator = resolveValidator(...inputs)
    
    // Modify Validator
    const modified = Modifier.add(validator, ...modifiers)

    // Wrap in IS
    return new Is(modified) as Return
}

//// Exports ////

export default To

export {
    To
}