import { equals } from '@benzed/immutable'
import { Trait } from '@benzed/traits'
import { isFunc, isShape } from '@benzed/util'

import ValidationContext from '../../validation-context'
import type { Validator } from '..'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

/**
 * The asserter trait provides functionality for determining if
 * a validation is valid.
 */
abstract class Asserter<I = any, O extends I = I> extends Trait {

    /**
     * Given a validator, context and unvalidated output, determine if the output
     * is valid. 
     * 
     * If the validator does not use the Asserter trait, output is considered valid
     * if the transformed value on the context is deep equal to given output
     */
    static isValid<I, O extends I>(validator: Validator<I,O> | object, ctx: ValidationContext<I,O>, output: I | O): output is O {
        return this.is(validator)
            ? validator.isValid(output, ctx)
            : equals(validator, ctx.transformed)
    }

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) => input is Asserter<Ix,Ox> = 
        isShape({
            isValid: isFunc 
        })

    abstract isValid(output: I | O, ctx: ValidationContext<I,O>): boolean

}

abstract class TypeAsserter<I = any, O extends I = I> extends Asserter<I,O> {

    abstract override isValid(output: I | O, ctx: ValidationContext<I, O>): output is O

}

//// Exports ////

export default Asserter

export {
    Asserter,
    TypeAsserter
}