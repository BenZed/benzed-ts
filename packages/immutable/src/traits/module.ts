import { Trait } from '@benzed/traits'
import { AnyTypeGuard, nil, isKeyed } from '@benzed/util'

//// Sybol ////

const $$parent = Symbol('module-parent')

//// Main ////

abstract class Module extends Trait {

    /**
     * Symbolic key used to define the module parent
     */
    static readonly parent: typeof $$parent = $$parent

    static [Trait.apply](trait: Module): Module {
        return trait
    }

    static override readonly is: (input: unknown) => input is Module = 
        isKeyed($$parent) as AnyTypeGuard

    abstract readonly [$$parent]: Module | nil

}

//// Exports ////

export default Module

export {
    Module
}