import { ModifierType, Optional, Validator } from '@benzed/schema'
import { Method } from '@benzed/traits'
import { nil } from '@benzed/util'
import { Is } from '../is'
import {
    String,
    $string,
    $boolean, 
    $number, 
} from '../schemas'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Types ////

enum OfType {
    Record = 'Record',
    Array = 'Array',
    // Set,
    // Map
}

type From = Validator | nil

type Clause = OfType | ModifierType | nil

//// Helper ////

interface ToSignature<F extends From, C extends Clause> {
    (): void
}

function to(): void {
    //
}

// type IsTo<F extends From, C extends Clause> = 
//     Is<>
//// Main ////

class To<F extends From, C extends Clause> extends Method<ToSignature<F,C>> {

    private readonly _from: F
    private readonly _clause: C

    constructor(options: { from: F, clause: C }) {
        super(to)
        this._from = options.from
        this._clause = options.clause
    }

    get optional() {
        return this._from 
            ? new Is(new Optional(this._from))
            : new To({
                from: nil,
                clause: ModifierType.Optional
            })
    }

    get string(): Is<String> {
        return new Is($string)
    }

    get boolean(): Is<Boolean> {
        return new Is($boolean)
    }

    get number() {
        return this($number)
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