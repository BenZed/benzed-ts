import { isShape, isFunc, AnyTypeGuard } from '@benzed/util'
import { Trait } from '@benzed/traits'

//// Symbol ////

const $$copy = Symbol('=')

//// Main ////

abstract class Copyable extends Trait {

    /**
     * Symbolic key used to implement the copy method.
     */
    static readonly copy: typeof $$copy = $$copy

    static override readonly is: (input: unknown) => input is Copyable = isShape({
        [$$copy]: isFunc
    }) as AnyTypeGuard

    protected abstract [$$copy](): this 

}

//// Exports ////

export default Copyable

export {
    Copyable
}