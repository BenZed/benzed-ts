import $ from '@benzed/schema'
import { nil } from '@benzed/util'
import { capitalize, toCamelCase } from '@benzed/string'

import { Module } from '../module'
import { HttpMethod, Request, RequestConverter } from '../util'

//// Validation ////

const { assert: assertCamelCase } = $.string.validates(toCamelCase, 'must be in camelCase')

//// Command Module ////

abstract class CommandModule<
    N extends string, 
    I extends object, 
    O extends object
> extends Module implements RequestConverter<I> {

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
     * for cors options / reasons 
     */
    abstract get method(): HttpMethod

    abstract toRequest(input: I): Request

    abstract matchRequest(req: Request): I | nil

    constructor(
        readonly _name: N
    ) {
        void assertCamelCase(_name)
        super()
    }

}

//// Exports ////

export default CommandModule

export {
    CommandModule
}