
import { Primitive } from '@benzed/util'

import { ValueValidator } from '../../validators'
import { SettingsSchema } from '../type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Validator ////

class Value <T extends Primitive> extends SettingsSchema<ValueValidator<T>, {}> {

    constructor(value: T) {
        super(
            new ValueValidator(value, false), 
            {}
        )
    }

    /**
     * Apply target value regardless of input
     */
    force(force = true): this {
        return this._applyMainValidator({ force })
    }

}

//// Exports ////

export {
    Value
}