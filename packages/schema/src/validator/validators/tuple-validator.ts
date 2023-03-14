
import { each, isArray, nil, pick } from '@benzed/util'
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

    override get name(): string {
        return 'Tuple'
    }

    message(input: unknown, ctx: ValidationContext<unknown, TupleValidatorOutput<T>>): string {
        void input
        void ctx
        return `must be ${this.name}`
    }

    default?(ctx: ValidationContext<unknown, TupleValidatorOutput<T>>): TupleValidatorOutput<T>

    [Validator.analyze](ctx: ValidationContext<unknown[], TupleValidatorOutput<T>>) {

        // Get Source Array
        const source = ctx.input === nil && this.default 
            ? this.default(ctx)
            : isArray(ctx.input) 
                ? ctx.input
                : nil

        if (!isArray(source)) {
            return ctx.setError(
                this.message(ctx.input, ctx)
            )
        }

        // Get Transformation
        const transformed: unknown[] = ctx.transformed = []

        // Validation Positions
        for (const index of each.indexOf(this.positions)) {

            let positionCtx = ctx.pushSubContext(ctx.input[index], index)
            const position = this.positions[index]

            positionCtx = position[Validator.analyze](positionCtx)
            if (positionCtx.hasValidOutput())
                transformed[index] = positionCtx.getOutput()
        }

        // Valiate Position Count
        const invalidPositionCount = !ctx.transform && ctx.input.length !== this.positions.length
        return invalidPositionCount
            ? ctx.setError(`must have exactly ${this.positions.length} elements`)
            : ctx.setOutput(transformed as TupleValidatorOutput<T>)
    }

    get [Validator.state](): Pick<this, 'positions' | 'name' | 'message'> {
        return pick(this, 'positions', 'name', 'message')
    }

}

//// Exports ////

export default TupleValidator

export {
    TupleValidator,
    TupleValidatorInput,
    TupleValidatorOutput
}