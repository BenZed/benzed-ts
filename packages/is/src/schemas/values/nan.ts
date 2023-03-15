import { Value } from './value'

//// Main ////

class NaN extends Value<number> {

    constructor() {
        super(globalThis.NaN)
    }

}

//// Exports ////

const $nan = new NaN

export {
    NaN,
    $nan
}