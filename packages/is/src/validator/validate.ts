
import { Callable } from '@benzed/util'

//// Types ////

interface ValidateOptions {

    readonly transform?: boolean

    readonly path?: readonly (symbol | string | number)[]

}

class Validate<I, O extends I | Promise<I>= I> extends Callable<(input: I, options?: ValidateOptions) => O> { }

//// Exports ////

export default Validate

export {
    Validate,
    ValidateOptions
}