import { Primitive } from '@benzed/util'
import Schematic from '../../schematic'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Value<T extends Primitive> extends Schematic<T> {

    constructor(readonly value: T) {
        super({
            is: i => Object.is(i, this.value),
            error: () => `Must be ${String(this.value)}`
        })

        this.value = value
    }
}

//// Exports ////

export default Value

export {
    Value
}