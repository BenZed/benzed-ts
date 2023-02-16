import { Trait, isIntersection, isObject, AnyTypeGuard, nil } from '@benzed/util'

//// Sybol ////

const $$module = Symbol('module-parent')

//// Main ////

abstract class Module extends Trait {

    static readonly module: typeof $$module = $$module

    static [Trait.apply](trait: Module): Module {
        return trait
    }

    static override readonly is: (input: unknown) => input is Module = isIntersection(
        isObject,
        ((i: unknown) => $$module in (i as object)) as AnyTypeGuard
    )

    abstract readonly [$$module]: Module | nil

}

//// Exports ////

export default Module

export {
    Module
}