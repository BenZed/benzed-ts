
import { NameErrorIdSignature } from '@benzed/schema'
import Value from './value'

//// Main ////

export class Undefined extends Value<undefined> {
    constructor(...args: NameErrorIdSignature<unknown>) {
        super(undefined, ...args)   
    }

}

//// Exports ////

export const $undefined: Undefined = new Value(undefined)
