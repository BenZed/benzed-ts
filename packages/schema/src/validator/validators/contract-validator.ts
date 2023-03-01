
import { equals } from '@benzed/immutable'

import { Validator } from '../validator'
import { ValidationContext } from '../../validation-context'
import { define, pick } from '@benzed/util'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

abstract class ContractValidator<I = any, O = I> extends Validator<I,O> {

    isValid(input: I | O, ctx: ValidationContext<I,O>): boolean {
        return equals(input, ctx.transformed)
    }

    transform?(input: I, ctx: ValidationContext<I,O>): I | O

    message(input: I, ctx: ValidationContext<I,O>): string {
        void input
        void ctx
        return `must be ${this.name}`
    }

    override get name(): string {
        return this.constructor.name.replace('Validator', '')
    }

    //// Analyze ////

    [Validator.analyze](ctx: ValidationContext<I,O>): ValidationContext<I,O> {

        if (this.transform)
            ctx.transformed = this.transform(ctx.input, ctx)

        // Determine output
        const output = ctx.transform 
            ? ctx.transformed
            : ctx.input

        // Apply result
        return this.isValid(output, ctx)
            ? ctx.setOutput(output as O)
            : ctx.setError(
                this.message(ctx.input, ctx)
            )
    }

    get [Validator.state](): Pick<this, 'message' | 'name'> {
        return pick(this, 'message', 'name')
    }

    set [Validator.state](state: Pick<this, 'message' | 'name'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
    }

}

//// Exports ////

export default ContractValidator 

export {
    ContractValidator
}