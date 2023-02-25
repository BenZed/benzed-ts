
import { each, nil, toNil } from '@benzed/util'
import { ValidateOutput } from '../../validate'

import ValidationContext from '../../validation-context'
import { ValidationErrorDetail } from '../../validation-error'
import { Validator } from '../validator'

//// Types //// 

type TupleInput = readonly Validator[]

type TupleOutput<T extends TupleInput> = T extends [infer T1, ...infer Tr]
    ? T1 extends Validator 
        ?Tr extends TupleInput 
            ? [ValidateOutput<T1>, ...TupleOutput<Tr>]
            : [ValidateOutput<T1>]
        : []
    : []

//// Tuple //// 

class TupleValidator<T extends TupleInput> extends Validator<unknown[], TupleOutput<T>> {

    readonly positions: T

    constructor(...positions: T) {
        super()
        this.positions = positions
    }

    transform(ctx: ValidationContext<unknown[]>) {
        return ctx.transformed
    }

    [Validator.analyze](ctx: ValidationContext<unknown[], TupleOutput<T>>) {

        const output: unknown[] = ctx.transformed = []
        let errors: ValidationErrorDetail<unknown[]> | nil = nil

        for (const i of each.indexOf(this.positions)) {

            const subCtx = ctx.pushSubContext(ctx.input[i], i)
            const subValidator = this.positions[i]

            const { result } = subValidator[Validator.analyze](subCtx)

            const subValidationFailed = !result || 'error' in result
            if (subValidationFailed) {
                errors ??= this.positions.map(toNil)
                errors[i as number] = result?.error.detail as string ?? 'validation incomplete'
            } else 
                ctx.transformed[i] = output[i] = result.output
        }

        if (!ctx.transform && ctx.input.length !== this.positions.length && !errors)
            errors = `must have exactly ${this.positions.length} elements`

        return errors 
            ? ctx.setError(errors)
            : ctx.setOutput(output as TupleOutput<T>)
    }

}

//// Exports ////

export default TupleValidator

export {
    TupleValidator,
    TupleInput,
    TupleOutput
}