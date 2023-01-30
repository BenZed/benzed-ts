
import { NameErrorIdSignature } from '@benzed/schema'
import Value from './value'

//// Main ////

export class Null extends Value<null> {
    constructor(...args: NameErrorIdSignature<unknown>) {
        super(null, ...args)
    }
}

//// Exports ////

export const $null: Null = new Value(null)
