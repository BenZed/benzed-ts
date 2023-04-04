import { 
    ValidateOutput, 
    ValidationContext,
    Validator, 
    AddModifier,
    ModifierType, 
    Modifier, 
    RemoveModifier,
    RemoveAllModifiers,
    ModifiersOf,
    AddModifiers
} from '@benzed/schema'

import { assign, TypeGuard } from '@benzed/util'
import { Callable, Mutate, Trait } from '@benzed/traits'
import { Comparable, equals, Copyable, copy } from '@benzed/immutable'

import { To } from './to'
import {
    Shape,
    ShapeInput,
    ShapeMerge,
    ShapePick,
    ShapeOmit,
    ShapePartial,
    ShapeProperty,
    ShapePropertyMethod
} from './schemas'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

interface _IsShape<S extends ShapeInput, M extends ModifierType[]> {

    get partial(): Is<AddModifiers<Shape<ShapePartial<S>>, M>>
    pick<K extends (keyof S)[]>(...keys: K): Is<AddModifiers<Shape<ShapePick<S,K>>, M>>
    omit<K extends (keyof S)[]>(...keys: K): Is<AddModifiers<Shape<ShapeOmit<S,K>>, M>>
    and<T extends ShapeInput>(shape: T | Shape<T>): Is<AddModifiers<Shape<ShapeMerge<S,T>>, M>>
    property<K extends keyof S, U extends ShapePropertyMethod<S, K>>(
        key: K,
        update: U
    ): Is<AddModifiers<Shape<ShapeProperty<S, K, U>>, M>>

}

type _IsDynamic<V extends Validator> = {
    [K in Exclude<keyof V, keyof _IsShape<ShapeInput, []> | keyof IsStatic<V>>]: V[K] extends (...args: any) => Validator 
        ? (...params: Parameters<V[K]>) => Is<ReturnType<V[K]>>
        : V[K]
}

//// Types ////

export interface IsCursor<V extends Validator> {
    get validate(): V
}

type Analyze = typeof Validator['analyze']

interface IsStatic<V extends Validator> extends IsCursor<V>, TypeGuard<ValidateOutput<V>> {

    get optional(): Is<AddModifier<V, ModifierType.Optional>>
    get required(): Is<RemoveModifier<V, ModifierType.Optional>>

    get readonly(): Is<AddModifier<V, ModifierType.ReadOnly>>
    get writable(): Is<RemoveModifier<V, ModifierType.ReadOnly>>

    get or(): To<[V], []>
    // get or(): To<[V], ToType.Or>
    // get of(): To<[V], ToType.Of>
    // get and(): To<[V], ToType.And>

    [Validator.analyze](...params: Parameters<V[Analyze]>): ReturnType<V[Analyze]>

    /**
     * type-only property
     */
    get output(): ValidateOutput<V>

    assert(input: unknown): asserts input is ValidateOutput<V>
}

export type Is<V extends Validator = Validator> = 
    IsStatic<V> & 
    _IsDynamic<V> & 
    (RemoveAllModifiers<V> extends Shape<infer S> 
        ? _IsShape<S, ModifiersOf<V>>
        : {})

export type ValidatorOf<T> = T extends Is<infer V>
    ? V 
    : T extends Validator ? T : never

export interface IsConstructor {
    is<V extends Validator>(input: unknown): input is Is<V>
    new <V extends Validator>(validator: V): Is<V>
}

//// Helper ////

function is(this: Is<Validator>, input: unknown): boolean {

    const { validate } = this

    const ctx = validate[Validator.analyze](
        new ValidationContext(input, { transform: false })
    )

    return ctx.hasValidOutput()
}

//// Implementation ////

export const Is = class Is extends Trait.use(Mutate<any>, Callable) {

    static is(input: unknown): boolean {
        return Callable.is(input) && input[Callable.signature] === is
    }

    constructor(validator: Validator) {
        super()
        this[Mutate.target] = validator
        return Trait.apply(this, Callable, Mutate)
    }

    //// Traits ////
    
    readonly [Mutate.target]!: Validator

    get [Callable.signature]() {
        return is
    }

    override get name(): string {
        return this.validate.name
    }

    [Copyable.copy](): this {
        const clone = Copyable.createFromProto(this)
        assign(clone, { [Mutate.target]: copy(this.validate) })
        return Trait.apply(clone, Callable, Mutate)
    }

    [Comparable.equals](other: unknown): other is this {
        return Is.is(other) && equals(
            (other as Is)[Mutate.target],
            this[Mutate.target]
        )
    }

    //// Is Interface ////

    get validate(): Validator {
        return this[Mutate.target]
    }

    get optional(): Is {
        return new Is(
            Modifier.add(
                this.validate,
                ModifierType.Optional
            )
        )
    }

    get required(): Is {
        return new Is(
            Modifier.remove(
                this.validate,
                ModifierType.Optional
            )
        )
    }

    get readonly(): Is {
        return new Is(
            Modifier.add(
                this.validate,
                ModifierType.ReadOnly
            )
        )
    }

    get writable(): Is {
        return new Is(
            Modifier.remove(
                this.validate,
                ModifierType.ReadOnly
            )
        )
    }

    get or(): To<[Validator],[]> {
        return new To(this.validate)
    }

    assert(input: unknown) {
        void this.validate(input, { transform: false })
    }

} as unknown as IsConstructor