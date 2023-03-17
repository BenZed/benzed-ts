import Module from '../../module'
import { Validateable } from '../../traits'
import { HttpMethod } from '../../util'

import { Node } from '@benzed/node'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

export type Execute<I = any, O = any> = (input: I) => Promise<O> | O

export abstract class Executable<I,O> extends Module.add(Module, Validateable) {

    execute(input: I): Promise<O> {

        const output = this.onExecute(input)
        return Promise.resolve(output)
    }

    abstract onExecute(input: I): Promise<O> | O

    abstract get method(): HttpMethod

    // Validation

    protected _onValidate(): void {
        if (Node.eachParent(this).find(p => p instanceof Executable))
            throw new Error(`${this.constructor.name} cannot be parented to other ${this.constructor.name} instances.`)
    }
}
