import { Stateful } from '@benzed/immutable'
import { Callable, Traits } from '@benzed/traits'
import { $$analyze, analyze, Analyzer } from '../analyze'
import { Validate } from '../validate'

import ValidationContext from '../validation-context'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Validator Constructor Type ////

type ValidatorConstructSignature = abstract new <I, O extends I>() => Validator<I,O>

interface ValidatorConstructor extends ValidatorConstructSignature {
    readonly analyze: typeof $$analyze
}

//// Validator Type////

/**
 * The primary type of this library. 
 * The Validator uses the analyze validate method as it's callable signature,
 * compelling extended classes to implement the symbolic analyze method 
 * to carry out validations.
 */
export interface Validator<I = any, O extends I = I> extends Analyzer<I,O>, Validate<I,O> {}

//// Validator Implementation ////

export const Validator = class extends Traits.add(Analyzer, Callable) {

    static readonly analyze = $$analyze

    get [Callable.signature]() {
        return analyze
    }

    // implementation is just to shut typescript up. Extended classes
    // will still be prompted to implement their own
    [$$analyze](ctx: ValidationContext): ValidationContext {
        void ctx
        throw new Error(`${this.constructor.name} has not implemented ${String($$analyze)}`)
    }

    get [Stateful.key](): never {
        return {} as never
    }

    set [Stateful.key](state: never) {
        void state
    }

} as ValidatorConstructor

