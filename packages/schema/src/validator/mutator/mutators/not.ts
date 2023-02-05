import { InputOf, KeysOf } from '@benzed/util'

import { 
    $$target, 
    $$type, 
    Mutator, 
    MutatorType 
} from '../mutator'

import {
    AddMutator,
    assertUnMutated,
    HasMutator,
    RemoveMutator
} from '../mutator-operations'

import { ValidateOptions } from '../../../validate'
import { ValidationContext } from '../../../validation-context'
import { ValidationError } from '../../../validation-error'
import { AnyValidatorStruct } from '../../validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _NotProperties<V extends AnyValidatorStruct> = 
    Mutator<V, MutatorType.Not, InputOf<V>> 
    & {
        get not(): V
    }

type _NotInheritKeys<V extends AnyValidatorStruct> = 
    Exclude<KeysOf<V>, KeysOf<_NotProperties<V>>>

type _NotWrapBuilderOutput<V extends AnyValidatorStruct, P> = P extends V
    ? Not<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Not<V> 
        : P

type _NotInherit<V extends AnyValidatorStruct> = {
    [K in _NotInheritKeys<V>]: _NotWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ToggleNot<V extends AnyValidatorStruct> =
    HasMutator<V, MutatorType.Not> extends true 
        ? RemoveMutator<V, MutatorType.Not>
        : AddMutator<V, MutatorType.Not>

type Not<V extends AnyValidatorStruct> = 
    _NotProperties<V> &
    _NotInherit<V>

interface NotConstructor {
    new <V extends AnyValidatorStruct>(validator: V): Not<V>
}

//// Implementation ////

const Not = class extends Mutator<AnyValidatorStruct, MutatorType.Not, unknown> {

    //// Construct ////
    
    constructor(target: AnyValidatorStruct) {

        assertUnMutated(target, MutatorType.Not)

        super(target)
    }

    protected get [$$type](): MutatorType.Not {
        return MutatorType.Not
    }

    //// Not Properties ////
    
    get not(): AnyValidatorStruct {
        return this[$$target]
    }

    override message(ctx: ValidationContext<unknown>): string {
        void ctx
        return `Must not be ${this[$$target].name}`
    }

    //// Not Mutation ////

    override validate(input: unknown, options?: ValidateOptions | undefined): unknown {
        const ctx = new ValidationContext(input, options)

        try {

            // TODO rather than catching and interpreting errors, there should
            // be a validation  option that only returns validation errors.
            // validator.report() or something
            void this[$$target].validate(input, { transform: false })
            //                                    ^ not validations should
            //                                    never be transformed.

        } catch (e) {
            if (e instanceof ValidationError)
                return input

            throw e // Some other error
        }

        throw new ValidationError(this.message(ctx), ctx)
    }

} as unknown as NotConstructor

//// Exports ////

export {
    Not,
    ToggleNot
}