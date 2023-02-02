import { ParamPipe, pick, Pipe } from '@benzed/util'

import { Validate, ValidateOptions } from '../../validate'
import { ValidateUpdateState } from '../validate-struct'
import { ValidatorStruct } from '../validator-struct'

//// Types ////

type InputValidator<I, O extends I> = Validate<I, O>

type OutputValidator<O> = Validate<O, O>

type Validators<I, O extends I> = [input: InputValidator<I,O>, ...output: OutputValidator<O>[]]

/**
 * The validate method used by a pipe validator. Specifically
 */
type PipeValidate<I, O extends I> = ParamPipe<I, O, [options?: ValidateOptions]>

//// Main ////

/**
 * Combine an input validator with many output validators.
 */
class PipeValidator<I, O extends I = I> extends ValidatorStruct<I, O> {

    readonly target: PipeValidate<I,O>

    constructor(...validators: Validators<I,O>) {
        super()
        this.target = Pipe.from(...validators) as PipeValidate<I,O>
    }

    /**
     * Contrary to the contract validator, ONLY the validate method 
     * of the pipe validator needs to change.
     */
    protected override [ValidatorStruct.$$assign](
        state: ValidateUpdateState<this>
    ): ValidateUpdateState<this> {
        return pick(state, 'validate')
    }

    //// Iteration ////
    
    *[Symbol.iterator](): IterableIterator<Validators<I,O>[number]> {
        yield* (
            this.target instanceof Pipe 
                ? this.target.transforms
                : [this.target]
        ) as Iterable<Validators<I,O>[number]>
    }
    
    get validators(): Validators<I,O> {
        return [...this] as Validators<I,O>
    }
}

//// Exports ////

export default PipeValidator

export {
    PipeValidator,
    PipeValidate,
    InputValidator,
    OutputValidator,
    Validators
}