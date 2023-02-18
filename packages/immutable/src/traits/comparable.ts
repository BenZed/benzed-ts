import { Trait, isShape, isFunc, AnyTypeGuard } from '@benzed/util'

//// Symbol ////

const $$equals = Symbol('==')

//// Main ////

abstract class Comparable extends Trait {

    /**
     * Symbolic key used to implement the compare method.
     */
    static readonly equals: typeof $$equals = $$equals

    static override readonly is: (input: unknown) => input is Comparable = isShape({
        [$$equals]: isFunc
    }) as AnyTypeGuard 

    protected abstract [$$equals](other: unknown): other is this 

}

//// Exports ////

export default Comparable

export {
    Comparable
}