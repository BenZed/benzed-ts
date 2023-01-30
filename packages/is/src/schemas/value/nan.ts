
import { NameErrorIdSignature } from '@benzed/schema'
import Value from './value'

//// Main ////

export class NaN extends Value<number> {
    constructor(...args: NameErrorIdSignature<unknown>) {
        super(globalThis.NaN, ...args)
    }
}

//// Exports ////

export const $nan = new NaN()
