import { Value } from './equal'

//// Exports ////

export class NaN extends Value<number> {

    constructor() {
        super(globalThis.NaN)
    }

}

export const $nan = new NaN