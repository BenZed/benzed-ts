
import { Pipe } from '@benzed/util'
import { Validate } from '../../validate'
import { ValidatorStruct } from '../validator-struct'
import { PipeValidate } from './pipe-validator'

//// Types ////

/**
 * Convenience Validator for transforming the output of one validator into
 * another
 */
export class Transformer<I, O extends I> extends ValidatorStruct<I,O> {

    readonly validate: PipeValidate<I,O>

    constructor(validator: Validate<I,O>) {
        super()
        this.validate = Pipe.from(validator) as PipeValidate<I, O>
    }

    to<Ox extends O>(validator: Validate<O, Ox>): Transformer<I, Ox> {
        const validate = this.validate.to(validator) as Validate<I, Ox>
        return new Transformer(validate)
    }

}

