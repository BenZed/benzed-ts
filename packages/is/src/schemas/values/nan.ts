import { Equal } from './equal'

//// Exports ////

export class NaN extends Equal<number> {

    constructor() {
        super(globalThis.NaN)
    }

}

export const $nan = new NaN