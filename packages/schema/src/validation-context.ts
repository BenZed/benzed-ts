import { Traits } from '@benzed/traits'
import { define, each, isNil, nil } from '@benzed/util'
import { AssertNode, FindNode, HasNode, Node } from '@benzed/node'

import type { ValidateOptions } from './validate'

import {
    ValidationError,
    ValidationErrorDetail
} from './validation-error'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type ValidationResult<I = any, O extends I = I> =
    {
        readonly error: ValidationError<I>
    } | {
        readonly output: O
    }

type UnknownValidationContext = ValidationContext<unknown,unknown>

//// Main ////

/**
 * An object containing data related to a validation call.
 */
class ValidationContext<I = any, O extends I = I>
    extends Traits.use(Node)
    implements ValidateOptions {

    /**
     * Input received by the current validation
     */
    readonly input: I

    /**
     * Input with transformations applied to it.
     */
    transformed: I | O

    /**
     * Should contain an error property if validation failed, and an
     * output property if validation succeeded.
     */
    result?: ValidationResult<I,O>

    /**
     * True if transformations are to be applied to the output during this validation.
     * They will be applied to the 'transformed' property regardless, but they will
     * only be applied to the result.output if this value is true.
     */
    readonly transform: boolean

    /**
     * Optional key or index to associate with the validated value,
     * useful for sub validations of container values.
     */
    readonly key?: PropertyKey

    constructor(input: I, options?: ValidateOptions) {
        super()
        this.input = input
        this.transformed = input
        this.transform = options?.transform ?? true
        this.key = options?.key
    }

    setOutput(output: O): this {
        this.result = { output }
        return this
    }

    setError(detail: ValidationErrorDetail<I>): this {
        this.result = {
            error: new ValidationError({
                key: this.key,
                value: this.input,
                detail,
            })
        }
        return this
    }

    get superContext() {
        return Node.getParent(this) as UnknownValidationContext | nil
    }

    get subContexts() {

        const subContexts: Record<PropertyKey, UnknownValidationContext> = {}

        for (const context of each.valueOf(Node.getChildren(this))) {
            if (!(context instanceof ValidationContext) || isNil(context.key))
                continue

            subContexts[context.key] = context
        }

        return subContexts
    }

    pushSubContext<Ix, Ox extends Ix>(
        input: Ix, 
        key: PropertyKey
    ): ValidationContext<Ix,Ox> {

        const subContext = new ValidationContext<Ix,Ox>(input, {
            transform: this.transform,
            key
        })

        const children = Node.getChildren(this)
        const nextIndex = each.keyOf(children).count()
        define.hidden(this, nextIndex, subContext)

        return subContext
    }

    get findContext() {
        return Node.find(this) as FindNode<UnknownValidationContext>
    }

    get hasContext() {
        return Node.has(this) as HasNode<UnknownValidationContext>
    }

    get assertContext() {
        return Node.assert(this) as AssertNode<UnknownValidationContext>
    }

}

//// Exports ////

export default ValidationContext

export {
    ValidationContext,
    ValidationResult
}