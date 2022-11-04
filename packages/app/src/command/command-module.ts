import $ from '@benzed/schema'
import { toDashCase } from '@benzed/string'
import { Chain } from '@benzed/util'

import { Module } from '../module'
import { HttpMethod } from '../modules'
import { Request, StringFields } from './request'

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

    protected abstract _execute: Chain<I,O>

    execute(input: I /* context <- user/etc */): O | Promise<O> {

        // Redirect this command to the client
        const client = this.parent?.root.client ?? null
        if (client)
            return client.execute(this.name, input) as Promise<O>

        /*
        const permissions = this.getModule(Permissions)
        if (permissions && context)
            permissions.check(context.user)
        */  

        return this._execute(input)
    }

    /**
     * Get a list of http methods this command may use for cors/options reasons 
     */
    abstract get methods(): HttpMethod[]

    abstract toRequest(input: I): Request<I, StringFields<I>>

    abstract fromRequest(
        method: HttpMethod,
        url: string,
        data: object,
    ): I | null

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