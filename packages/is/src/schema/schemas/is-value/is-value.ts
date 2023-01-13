import { Primitive } from '@benzed/util'
import { ChainableSchematic } from '../chainable'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class IsValue<T extends Primitive> extends ChainableSchematic<T> {

    constructor(readonly value: T) {
        super({
            is: i => Object.is(i, this.value),
            error: () => `Must be ${String(this.value)}`
        })

        this.value = value
    }
}

//// Exports ////

export default IsValue

export {
    IsValue
}