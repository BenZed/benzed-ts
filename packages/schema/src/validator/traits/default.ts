import { Trait } from '@benzed/traits'
import { isFunc, isShape } from '@benzed/util'
import ValidationContext from '../../validation-context'

//// Main ////

abstract class Default<I> extends Trait {

    static override readonly is: <Ix>(input: unknown) => input is Default<Ix> = isShape({
        default: isFunc 
    })

    abstract default(ctx: ValidationContext<I>): I

}

//// Exports ////

export default Default

export {
    Default
}