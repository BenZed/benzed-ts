
import { each } from '@benzed/util'
import { ValidateOutput } from '../../validate'

import ValidationContext from '../../validation-context'
import { Validator } from '../validator'

//// Types //// 

type TupleValidatorInput = readonly Validator[]

type TupleValidatorOutput<T extends TupleValidatorInput> = T extends [infer T1, ...infer Tr]
    ? T1 extends Validator 
        ?Tr extends TupleValidatorInput 
            ? [ValidateOutput<T1>, ...TupleValidatorOutput<Tr>]
            : [ValidateOutput<T1>]
        : []
    : []

//// Tuple //// 

class TupleValidator<T extends TupleValidatorInput> extends Validator<unknown[], TupleValidatorOutput<T>> {

    readonly positions: T

    constructor(...positions: T) {
        super()
        this.positions = positions
    }

    [Validator.analyze](ctx: ValidationContext<unknown[], TupleValidatorOutput<T>>) {

        const output: unknown[] = ctx.transformed = []

        for (const index of each.indexOf(this.positions)) {

            let positionCtx = ctx.pushSubContext(ctx.input[index], index)
            const position = this.positions[index]

            positionCtx = position[Validator.analyze](positionCtx)
            if (positionCtx.hasValidOutput())
                output[index] = positionCtx.getOutput()
        }

        const invalidElementCount = !ctx.transform && ctx.input.length !== this.positions.length
        return invalidElementCount
            ? ctx.setError(`must have exactly ${this.positions.length} elements`)
            : ctx.setOutput(output as TupleValidatorOutput<T>)
    }

}

//// Exports ////

export default TupleValidator

export {
    TupleValidator,
    TupleValidatorInput,
    TupleValidatorOutput
}