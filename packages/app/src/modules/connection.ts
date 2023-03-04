import { Module } from '../module'
import { OnStart, OnStop } from '../traits'
import OnValidate from '../traits/on-validate'

//// Main ////

abstract class Connection extends Module.add(Module, OnStart, OnStop, OnValidate) {

    onValidate(): void {
        this._assertUnique()
    }

}

//// Exports ////

export {
    Connection
}