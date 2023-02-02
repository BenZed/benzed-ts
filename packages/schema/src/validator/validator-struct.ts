import { $$assign, equals, StructAssignState } from '@benzed/immutable'
import { isArray, isObject, isString, keysOf, nil, pick, provideCallableContext } from '@benzed/util'

import { ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'
import { ValidateStruct } from './validate-struct'
import { Validator } from './validator'
import { showProperty } from './validators/schema/property-helpers'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Symbol ////

export const $$state = Symbol('validate-state-keys')

/**
 * Implementing this interface on validators will allow
 * schemas to create state setters.
 */
export interface ValidatorState<T extends object> {

    get [$$state](): T

}

//// ValidatorStruct ////

/**
 * Default for Callable Validator structs. Quite simply, it calls
 * it's own validate method, and we never have to worry about passing a
 * different callable signature into any extended classes.
 */
export function validate<I, O extends I>(
    this: Validator<I,O>, 
    input: I, 
    options?: ValidateOptions
): O {
    return this.validate(input, options)
}

/**
 * Most of the rest of the methods in this library will inherit from 
 * ValidatorStruct. A validator struct is both a validate method and 
 * a validator, making it the base class for the most widely applicable 
 * object for fulfilling validation interface related contracts.
 */
export abstract class ValidatorStruct<I, O extends I = I>
    extends ValidateStruct<I,O>
    implements Validator<I,O> {

    constructor() {
        super(validate, provideCallableContext)

        // make all custom state properties enumerable
        if ($$state in this && isObject(this[$$state])) {
            for (const key of keysOf(this[$$state])) {
                if (key in this) // may not be initialized yet
                    showProperty(this, key)
            }
        }

        // message is always a state property
        showProperty(this, 'message')
    }

    abstract validate(input: I, options?: ValidateOptions): O

    /**
     * Logic for determining if an input is equal to it's output and
     * vise versa, so overridden implementations should be transitive.
     *
     * This defaults to a deep equality check according to the
     * default @benzed/immutable $$equal algorithm.
     */
    equal<T extends I | O>(input: I | O, output: T): input is T {
        return equals(input, output)
    }

    message(ctx: ValidationContext<I>): string {
        void ctx
        return `${this.name} validation failed.`
    }

    protected override [$$assign](state: StructAssignState<this>): StructAssignState<this> {

        const keys = $$state in this && isArray(this[$$state], isString) 
            ? [...this[$$state], 'enabled', 'message', 'name']
            : nil

        return keys ? pick(state, ...keys) : state
    }

}

export type AnyValidatorStruct= ValidatorStruct<any,any>
