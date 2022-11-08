import $ from '@benzed/schema'
import { capitalize, toCamelCase } from '@benzed/string'

import { Module } from '../module'
import { HttpMethod } from '../modules'
import { Request, StringFields } from './request'

//// Validation ////

const $camelCase = $.string.validates(toCamelCase, n => `"${n}" must be camelCased`)

//// Command Module ////

abstract class CommandModule<
    N extends string, 
    I extends object, 
    O extends object
> extends Module {

    override get name(): N {
        return this._name
    }

    protected abstract _execute(input: I) : O | Promise<O>

    execute(input: I): O | Promise<O> {

        // Redirect this command to the client
        const client = this.parent?.root.client ?? null
        if (client) {
            const path = this.pathFromRoot
            const rootName = path.length > 1
                ? path // "/deep/nested/service" => "deepNestedService${name}"
                    .split('/')
                    .filter(i => i)
                    .concat(this.name)
                    .map((n,i) => i === 0 ? n : capitalize(n))
                    .join('')
                
                : this.name

            return client.execute(rootName, input) as Promise<O>
        }

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

    abstract fromRequest(req: Request<object>): Omit<I, StringFields<I>> | null

    constructor(
        readonly _name: N
    ) {
        void $camelCase.assert(_name)
        super()
    }

}

//// Exports ////

export default CommandModule

export {
    CommandModule
}