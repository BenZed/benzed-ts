import $ from '@benzed/schema'
import { toCamelCase } from '@benzed/string'

import { RequestHandler } from '../util'
import { ExecutableModule } from '../module'
import { Client } from '../modules'

//// Validation ////

const { assert: assertCamelCase } = $.string.validates(toCamelCase, 'must be in camelCase')

//// Execute ////

function deferExecution<I extends object, O extends object>(
    this: CommandModule<string,I,O>, 
    input: I
): O | Promise<O> {
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
> extends ExecutableModule<I,O | Promise<O>> {

    override get name(): N {
        return this._name
    }

    protected _executeOnClient (input: I): O | Promise<O> {
        const client = this.root.getModule(Client, true)
        return client.execute(this as CommandModule<string, I, O>, input) as O
    }

    protected abstract _executeOnServer (input: I): O | Promise<O>

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