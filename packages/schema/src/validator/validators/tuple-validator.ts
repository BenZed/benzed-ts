
import { each } from '@benzed/util'
import { ValidateOutput } from '../../validate'

import ValidationContext from '../../validation-context'
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

        for (const index of each.indexOf(this.positions)) {

            let indexCtx = ctx.pushSubContext(ctx.input[index], index)
            const position = this.positions[index]

            indexCtx = position[Validator.analyze](indexCtx)
            if (indexCtx.hasOutput())
                output[index] = indexCtx.getOutput()
        }

        const invalidElementCount = !ctx.transform && ctx.input.length !== this.positions.length

        return invalidElementCount
            ? ctx.setError(`must have exactly ${this.positions.length} elements`)
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