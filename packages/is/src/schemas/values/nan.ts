import { Value } from './value'

//// Main ////

export class NAN extends Value<number> {

    constructor() {
        super(globalThis.NaN)
    }

}

//// Exports ////

export const $nan = new NAN

