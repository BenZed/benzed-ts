import $ from '@benzed/schema'
import { toCamelCase } from '@benzed/string'
import { ToAsync } from '@benzed/async'

import { RequestHandler } from '../../util'

import CommandError from './command-error'

import { ExecutableModule } from '../../executable-module'
import type { Client } from '../connection'

//// Validation ////

const { assert: assertCamelCase } = $.string.validates(toCamelCase, 'must be in camelCase')

//// Execute ////

/**
 * Defer execution of a promise to the client if applicable, handling 
 * cases for async or sync errors
 */
function deferExecution<I extends object, O extends object>(
    this: CommandModule<string, I, O>, 
    input: I
): ToAsync<O> {

    try {

        const client = this.parent?.root.client

        const result = client 
            ? this._executeOnClient(input)
            : this._executeOnServer(input)

        return Promise
            .resolve(result)
            .catch(e => Promise.reject(CommandError.from(e))) as ToAsync<O>

    } catch (e) {
        throw CommandError.from(e)
    }
}

//// Command Module ////

abstract class CommandModule<
    N extends string, 
    I extends object, 
    O extends object
> extends ExecutableModule<I, ToAsync<O>> {

    override get name(): N {
        return this._name
    }

    protected _executeOnClient (input: I): ToAsync<O> {
        const client = this.root.client as Client
        return client._execute(
            this as CommandModule<string, I, O>, 
            input
        )
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