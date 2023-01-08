
import { Callable } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface ValidateOptions {

    readonly transform?: boolean

    readonly path?: readonly (symbol | string | number)[]

}

/**
 * @internal
 */
type AnyValidate = Validate<any,any>

class Validate<I, O extends I = I> extends Callable<(input: I, options?: ValidateOptions) => O> { }

//// Exports ////

export default Validate

export {
    Validate,
    AnyValidate,
    ValidateOptions
}