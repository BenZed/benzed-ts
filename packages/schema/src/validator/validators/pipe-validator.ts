import { ParamPipe, Pipe } from '@benzed/util'

import { Validate, ValidateOptions } from '../../validate'
import { ValidatorStruct } from '../validator-struct'

//// Types ////

type Validators<I, O extends I> = [
    input: Validate<I,O>, 
    ...output: Validate<O, O>[]
]

/**
 * The validate method used by a pipe validator. Specifically
 */
type PipeValidate<I, O extends I> = ParamPipe<I, O, [options?: ValidateOptions]>

//// Main ////

/**
 * Combine an input validator with many output validators.
 */
class PipeValidator<I, O extends I = I> extends ValidatorStruct<I, O> {

    readonly validate: PipeValidate<I,O>

    constructor(...validators: Validators<I,O>) {
        super()
        this.validate = Pipe.from(...validators) as PipeValidate<I,O>
    }

    //// Iteration ////

    *[Symbol.iterator](): IterableIterator<Validators<I,O>[number]> {
        yield* (
            this.validate instanceof Pipe 
                ? this.validate.transforms
                : [this.validate]
        ) as Iterable<Validators<I,O>[number]>
    }

    get validators(): Validators<I,O> {
        return [ ...this ] as Validators<I,O>
    }
}

//// Exports ////

export default PipeValidator

export {
    PipeValidator,
    PipeValidate,
    Validators
}