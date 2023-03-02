import { Value } from './value'

//// Exports ////

export class NaN extends Value<number> {

    constructor() {
        super(globalThis.NaN)
    }

}

export const $nan = new NaN