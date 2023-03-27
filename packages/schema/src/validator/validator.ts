import { 
    Copyable, 
    equals, 
    Stateful, 
    StructState, 
    Structural, 
    StructStateApply, 
    StructStateUpdate,
    StructStatePath 
} from '@benzed/immutable'

import { Callable, Trait } from '@benzed/traits'

import { Validate, ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'
import ValidationError from '../validation-error'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

/**
 * Property key for implementations of the analyze method
 */
export const $$analyze = Symbol('validation-analyze')

//// Validate Method ////

/**
 * There is only one validate method in all of @benzed/schema, and this is it:
 * 
 * Validations are conducted by creating a validation context out of an input
 * and validation options. 
 * 
 * Context is given to the scoped analyze method, which has logic to mutate 
 * the context by applying errors or output.
 * 
 * If the mutated context does not have an output, a validation error is thrown,
 * otherwise the output is returned.
 */
function analyze<I, O >(this: Validator<I,O>, input: I, options?: ValidateOptions): O {

    const ctx = this[$$analyze](
        new ValidationContext(input, options)
    )

    if (!ctx.hasValidOutput())
        throw new ValidationError(ctx)

    return ctx.getOutput()
}

//// Validator ////

/*
 * The primary type of this library. 
 * The Validator uses the analyze validate method as it's callable signature,
 * compelling extended classes to implement the symbolic analyze method 
 * to carry out validations.
 */
export interface Validator<I = any, O = I> extends Structural, Callable<Validate<I,O>> {
}

export abstract class Validator<I = any, O = I> implements Structural, Callable<Validate<I,O>> {

    static is(input: unknown): input is Validator {
        return Callable.is(input) && input[Callable.signature] === analyze
    }

    static readonly analyze: typeof $$analyze = $$analyze
    static readonly state: typeof Structural.state = Structural.state
    static readonly copy: typeof Structural.copy = Structural.copy
    static readonly equals: typeof Structural.equals = Structural.equals

    /**
     * Given a validator and a state update, apply the state by
     * updating any nested validators with their appropriate nested
     * object state.
     */
    static setState<T extends Validator, P extends ValidatorStatePath>(
        validator: T, 
        ...params: readonly [ ...P, ValidatorStateApply<T, P> ]
    ): void {
        Structural.set(validator, ...params)
    }

    /**
     * Given a struct, resolve the state of that struct by recursively
     * resolving the state of any nested sub structs.
     */
    static get<T extends Validator, P extends ValidatorStatePath>(
        validator: T, 
        ...path: P
    ): ValidatorState<T, P> {
        return Structural.get(validator, ...path)
    }

    /**
     * Create a validator from an original and a new state
     */
    static applyState<T extends Validator, P extends StructStatePath>(
        validator: T, 
        ...params: [ ...P, ValidatorStateApply<T, P> ]
    ): T {
        return Structural.create(validator, ...params)
    }

    /**
     * Update a validator from an original and a new state
     */
    static updateState<T extends Validator, P extends StructStatePath>(
        validator: T,
        ...params: [ ...P, ValidatorStateUpdate<T, P> ]
    ): T {
        return Structural.update(validator, ...params)
    }

    //// Construct ////
    
    constructor() {
        return Callable.apply(this as any)
    }

    //// Implementations ////

    get [Callable.signature]() {
        return analyze
    }

    [Structural.copy](): this {
        const clone = Copyable.createFromProto(this)
        Stateful.set(clone, Stateful.get(this))

        return Callable.apply(clone as any)
    }

    [Structural.equals](other: unknown): other is this {
        return (
            other instanceof Validator &&
            other.constructor === this.constructor &&
            equals(
                Stateful.get(other),
                Stateful.get(this)
            )
        )
    }

    abstract get [Structural.state](): object

    /**
     * Given an input and validation options, the analyze method will:
     * - create a validation context
     * - analyze the input on that context
     * - attach a validation result to the context; output or error
     * - return the context
     */
    abstract [$$analyze](ctx: ValidationContext<I, O>): ValidationContext<I, O>

}

export type ValidatorStatePath = StructStatePath

export type ValidatorState<V extends Validator, P extends ValidatorStatePath = []> = StructState<V, P>

export type ValidatorStateApply<V extends Validator, P extends ValidatorStatePath = []> = StructStateApply<V, P>

export type ValidatorStateUpdate<V extends Validator, P extends ValidatorStatePath = []> = StructStateUpdate<V, P>

//// Manually apply Callable.onUse //// 

Callable[Trait.onUse](Validator)