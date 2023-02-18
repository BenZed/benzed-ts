
import { each, TypeGuard } from '@benzed/util'

import { AnyValidate, ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import ValidationError from '../../validation-error'
import { ValidatorStruct } from '../validator-struct'

//// Types //// 

type TupleInput = readonly AnyValidate[]

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

class TupleValidator<T extends TupleInput> extends ValidatorStruct<unknown[], TupleOutput<T>> {

    readonly types: T

    constructor(...types: T) {
        super()
        this.types = types
    }

    validate(input: unknown[], options?: ValidateOptions): TupleOutput<T> {

        const ctx = new ValidationContext(input, options)

        const transformed: unknown[] = ctx.transformed = []

        for (const index of each.indexOf(input)) {
            const validateIndex = this.types[index]
            const value = input[index]
            transformed[index] = validateIndex(value, ctx)
        }

        ctx.transformed = transformed

        const output = ctx.transform ? ctx.transformed : input
        if (!ValidatorStruct.equal(input, output))
            throw new ValidationError(this, ctx)

        return output as TupleOutput<T>
    }

}

//// Exports ////

export default TupleValidator

export {
    TupleValidator,
    TupleInput,
    TupleOutput
}