import { ModifierType, Validate } from '@benzed/schema'
import { Method } from '@benzed/traits'

//// Types ////

interface ToSignature {
    (): void
}

enum OfType {
    RecordOf,
    Array,
    // Set,
    // Map
}

type From = [Validate] | []

type Clause = [ModifierType] | [OfType]

//// Helper ////

function to(): void {
    //
}

//// Main ////

class To<F extends From, C extends Clause> extends Method<ToSignature> {

    constructor() {
        super(to)
    }

    get optional() {
    }

    get string() {

    }

    get boolean() {

    }

    get number() {

    }

    get or() {

    }

    get array() {

    }

    shape() {

    }

}

//// Exports ////

export default To

export {
    To
}