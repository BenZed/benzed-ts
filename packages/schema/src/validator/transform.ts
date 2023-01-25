import { Transform } from '@benzed/util'
import { ValidateOptions } from './validate-options'
import ValidateStruct from './validate-struct'

////  ////

class Transformer<I, O> extends ValidateStruct<I, I | O> {

    constructor(readonly transform: Transform<I, O>) {
        super(function (
            this: Transformer<I, O>, 
            input: I,
            options?: Partial<ValidateOptions>
        ) {
            return options?.transform ? this.transform(input) : input
        })
    }
}

const parser = new Transformer(parseFloat)