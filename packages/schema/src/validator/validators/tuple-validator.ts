
import { equals } from '@benzed/immutable'
import { each, nil, toNil, TypeGuard } from '@benzed/util'

import { ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import { ValidationError, ValidationErrorDetail } from '../../validation-error'
import { Validator } from '../validator'

//// Types //// 

type TupleInput = readonly Validator[]

type TupleOutput<T extends TupleInput> = T extends [infer T1, ...infer Tr]
    ? Tr extends TupleInput 
        ? T1 extends TypeGuard<infer O>
            ? [O, ...TupleOutput<Tr>]
            : [unknown, ...TupleOutput<Tr>]
        : T1 extends TypeGuard<infer O> 
            ? [O]
            : [unknown]
    : []

//// Tuple //// 

class TupleValidator<T extends TupleInput> extends Validator<unknown[], TupleOutput<T>> {

    readonly positions: T

    constructor(...positions: T) {
        super()
        this.positions = positions
    }

    [Validator.analyze](input: unknown[], options?: ValidateOptions): ValidationContext<unknown[], TupleOutput<T>> {

        const ctx = new ValidationContext<unknown[], TupleOutput<T>>(input, options)

        const output: unknown[] = ctx.transformed = []

        let errors: ValidationErrorDetail<unknown[]> | nil = nil

        for (const i of each.indexOf(this.positions)) {

            const position = this.positions[i]
            const positionInput = input[i]

            const { result } = position[Validator.analyze](
                positionInput, 
                ctx.pushSubContext(positionInput, { ...ctx, key: i })
            )

            if (!result || 'error' in result) {
                errors ??= this.positions.map(toNil)
                errors[i as number] = result?.error.detail as string ?? 'validation incomplete'

            } else 
                ctx.transformed[i] = output[i] = result.output

        }

        if (!ctx.transform && input.length !== this.positions.length && !errors)
            errors = `must have exactly ${input.length} elements`

        ctx.result = errors 
            ? {
                error: new ValidationError({ 
                    key: ctx.key, 
                    value: input, 
                    detail: errors 
                })
            }
            : {
                output: output as TupleOutput<T>
            }

        return ctx
    }

}

//// Exports ////

export default TupleValidator

export {
    TupleValidator,
    TupleInput,
    TupleOutput
}