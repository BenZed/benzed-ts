
import {
    SchemaBuilder,
    TupleValidator,
    TupleValidatorInput,
    TupleValidatorOutput
} from '@benzed/schema'

//// Intro ////

class Tuple<T extends TupleValidatorInput> extends SchemaBuilder<TupleValidator<T>, {}> {

    constructor(...positions: T) {
        super(
            new TupleValidator(...positions),
            {}
        )
    }

    get positions(): T {
        return this[SchemaBuilder.main].positions
    }

}

//// Exports ////

export default Tuple

export {
    Tuple,
    TupleValidatorInput as TupleInput,
    TupleValidatorOutput as TupleOutput
}