import { Traits } from '@benzed/traits'
import { define, each, isNil, nil } from '@benzed/util'
import { AssertNode, FindNode, HasNode, Node } from '@benzed/node'

import type { ValidateOptions } from './validate'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type ValidationResult<I = any, O = I> =
    {
        readonly error: string
    } | {
        readonly output: O
    }

type UnknownValidationContext = ValidationContext<unknown,unknown>

//// Main ////

/**
 * An object containing data related to a validation call.
 */
class ValidationContext<I = any, O = I>
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

    hasOutput(): this is { result: { output: O } } {
        return !!this.result && 'output' in this.result
    }

    /**
     * Context has output, no error and no sub context errors.
     */
    hasValidOutput(): this is { result: { output: O } } {
        return (
            this.hasOutput() &&
            !this.hasError() &&
            !this.hasSubContextError()
        )
    }

    getOutput(): O {
        if (!this.hasValidOutput())
            throw new Error('No output.')

        return this.result.output
    }

    hasError(): this is { result: { error: string } } {
        return !!this.result && 'error' in this.result
    }

    getError(): string {
        if (!this.hasError())
            throw new Error('No error.')

        return this.result.error
    }

    setError(error: string): this {
        this.result = { error }
        return this
    }

    get superContext() {
        return Node.getParent(this) as UnknownValidationContext | nil
    }

    get subContexts() {

        let subContexts: Record<PropertyKey, UnknownValidationContext> | nil = nil

        for (const context of each.valueOf(Node.getChildren(this))) {
            if (!(context instanceof ValidationContext) || isNil(context.key))
                continue

            subContexts ??= {}
            subContexts[context.key] = context
        }

        return subContexts
    }

    hasSubContextError(): boolean {
        return this.hasSubContext.inDescendents(sub => sub.hasError())
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

    clearSubContexts(): this {
        for (const key of each.keyOf(Node.getChildren(this))) 
            delete this[key]

        return this
    }

    get path() {
        let ctx: UnknownValidationContext | nil = this
        const path: PropertyKey[] = []

        while (ctx?.key !== nil) {
            path.push(ctx.key)
            ctx = ctx.superContext
        }

        return path.reverse()
    }

    get findSubContext() {
        return Node.find(this) as FindNode<UnknownValidationContext>
    }

    get hasSubContext() {
        return Node.has(this) as HasNode<UnknownValidationContext>
    }

    get assertSubContext() {
        return Node.assert(this) as AssertNode<UnknownValidationContext>
    }

}

//// Exports ////

export default ValidationContext

export {
    ValidationContext,
    UnknownValidationContext,
    ValidationResult
}