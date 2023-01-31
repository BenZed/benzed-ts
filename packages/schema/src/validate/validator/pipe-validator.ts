import { ParamPipe, pick, Pipe } from '@benzed/util/src'
import { Validate, ValidateOptions } from '../validate'
import { ValidateState, ValidatorStruct } from './validator'

//// Types ////

type SubValidator<O> = Validate<O, O>

type Validators<I, O extends I> = [main: Validate<I,O>, ...sub: SubValidator<O>[]]

//// Main ////

/**
 * Combine an input validator with many output validators.
 */
class PipeValidator<I, O extends I = I> extends ValidatorStruct<I, O> {

    readonly validate: ParamPipe<I,O,[options?: ValidateOptions]>

    constructor(...validators: Validators<I,O>) {
        super()
        this.validate = Pipe.from(...validators) as ParamPipe<I,O,[options?: ValidateOptions]>
    }

    /**
     * Contrary to the contract validator, ONLY the validate method 
     * of the pipe validator needs to change.
     */
    protected override [ValidatorStruct.$$assign](state: ValidateState<this>): ValidateState<this> {
        return pick(state, 'validate')
    }

    //// Iteration ////
    
    *[Symbol.iterator](): IterableIterator<Validators<I,O>[number]> {
        yield* (this.validate instanceof Pipe 
            ? this.validate.transforms
            : [this.validate]) as Iterable<Validators<I,O>[number]>
    }
    
    get validators(): Validators<I,O> {
        return [...this] as Validators<I,O>
    }
}

//// Exports ////

export default PipeValidator

export {
    PipeValidator,
    SubValidator,
    Validators
}