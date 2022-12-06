import $ from '@benzed/schema'
import { capitalize, toCamelCase } from '@benzed/string'

import { Client } from '../modules'
import { RequestHandler } from '../util'
import ExecutableModule from './executable-module'

//// Validation ////

const { assert: assertCamelCase } = $.string.validates(toCamelCase, 'must be in camelCase')

//// Execute ////

function deferExecution<I extends object, O extends object>(
    this: CommandModule<string,I,O>, 
    input: I
): O {
    const client = this.parent?.root.client ?? null
    return client 
        ? this._executeOnClient(input)
        : this._executeOnServer(input)
}

//// Command Module ////

abstract class CommandModule<
    N extends string, 
    I extends object, 
    O extends object
> extends ExecutableModule<I,O> {

    override get name(): N {
        return this._name
    }

    protected _executeOnClient (input: I): O {
        const client = this.root.getModule(Client, true)

        const path = this.pathFromRoot
        const rootName = path.length > 1
            ? path // "/deep/nested/service" => "deepNestedService${name}"
                .split('/')
                .filter(i => i)
                .concat(this.name)
                .map((n,i) => i === 0 ? n : capitalize(n))
                .join('')
            
            : this.name

        return client.execute(rootName, input) as O
    }

    protected abstract _executeOnServer (input: I): O

    constructor(
        readonly _name: N,
        readonly request: RequestHandler<I>
    ) {
        void assertCamelCase(_name)
        super(
            deferExecution,
        )
    }

    protected override get _copyParams(): unknown[] {
        return [this._name, this.execute]
    }

}

//// Exports ////

export default CommandModule

export {
    CommandModule
}