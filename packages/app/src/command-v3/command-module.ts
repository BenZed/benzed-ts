import $ from '@benzed/schema'
import { toDashCase } from '@benzed/string'

import { Module } from '../module'

//// Validation ////

const $dashCase = $.string.validates(toDashCase, n => `"${n}" must be dash-cased`)

//// Command Module ////

abstract class CommandModule<
    N extends string, 
    I extends object, 
    O extends object
> extends Module {

    override get name(): N {
        return this._name
    }

    abstract execute(input: I): O

    /*
    abstract toRequest(input: I): {
        method: HttpMethod
        url: string
        body: object
    }

    abstract fromRequest(
        method: HttpMethod,
        url: string,
        query: object,
        body: object
    ): I | null
    */

    constructor(
        readonly _name: N
    ) {
        void $dashCase.assert(_name)
        super()
    }

}

//// Exports ////

export default CommandModule

export {
    CommandModule
}