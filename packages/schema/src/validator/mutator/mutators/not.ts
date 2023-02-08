import { InputOf, NamesOf } from '@benzed/util'

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
import { AnyValidateStruct } from '../../validate-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper Types ////

type _NotProperties<V extends AnyValidateStruct> = 
    Mutator<V, MutatorType.Not, InputOf<V>> 
    & {
        get not(): V
    }

type _NotInheritKeys<V extends AnyValidateStruct> = 
    Exclude<NamesOf<V>, NamesOf<_NotProperties<V>>>

type _NotWrapBuilderOutput<V extends AnyValidateStruct, P> = P extends V
    ? Not<V>
    : P extends (...args: infer A) => V 
        ? (...args: A) => Not<V> 
        : P

type _NotInherit<V extends AnyValidateStruct> = {
    [K in _NotInheritKeys<V>]: _NotWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ToggleNot<V extends AnyValidateStruct> =
    HasMutator<V, MutatorType.Not> extends true 
        ? RemoveMutator<V, MutatorType.Not>
        : AddMutator<V, MutatorType.Not>

type Not<V extends AnyValidateStruct> = 
    _NotProperties<V> &
    _NotInherit<V>

interface NotConstructor {
    new <V extends AnyValidateStruct>(validator: V): Not<V>
}

//// Implementation ////

const Not = class extends Mutator<AnyValidateStruct, MutatorType.Not, unknown> {

    //// Construct ////
    
    constructor(target: AnyValidateStruct) {

        assertUnMutated(target, MutatorType.Not)

        super(target)
    }

    protected get [$$type](): MutatorType.Not {
        return MutatorType.Not
    }

    //// Not Properties ////
    
    get not(): AnyValidateStruct {
        return this[$$target]
    }

    message(ctx: ValidationContext<unknown>): string {
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
            void this[$$target](input, { transform: false })
            //                                    ^ not validations should
            //                                    never be transformed.

        } catch (e) {
            if (e instanceof ValidationError)
                return input

            throw e // Some other error
        }

        throw new ValidationError(this, ctx)
    }

} as unknown as NotConstructor

//// Exports ////

export {
    Not,
    ToggleNot
}