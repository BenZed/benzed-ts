import { Module } from '../module'
import { Runnable } from '../traits'
import Validateable from '../traits/validateable'

//// Main ////

abstract class Connection extends Module.add(Module, Runnable, Validateable) {

    protected _onValidate(): void {
        this._assertUnique()
        this._assertRootParent()
    }

}

//// Exports ////

export {
    Connection
}