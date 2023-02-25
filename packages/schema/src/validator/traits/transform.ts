import { Trait } from '@benzed/traits'
import { isFunc, isShape } from '@benzed/util'

import ValidationContext from '../../validation-context'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

/**
 * The transform trait provides functionality for transforming a
 * validation input into it's desired output.
 */
abstract class Transform<I = any, O extends I = I> extends Trait {

    static override readonly is: <Ix, Ox extends Ix>(input: unknown) => input is Transform<Ix, Ox> = 
        isShape({
            transform: isFunc 
        })

    abstract transform(input: I, ctx: ValidationContext<I,O>): I | O

}

//// Exports ////

export default Transform

export {
    Transform
}