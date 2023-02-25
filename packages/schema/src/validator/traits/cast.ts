import { Trait } from '@benzed/traits'
import { isFunc, isShape } from '@benzed/util'

import ValidationContext from '../../validation-context'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

abstract class Cast<I = any, O extends I = I> extends Trait {

    static override readonly is: <Ix, Ox extends Ix>(
        input: unknown
    ) => input is Cast<Ix, Ox> = isShape({
            cast: isFunc 
        }) 

    abstract cast(input: I, ctx: ValidationContext<I>): I | O

}

//// Exports ////

export default Cast

export {
    Cast
}