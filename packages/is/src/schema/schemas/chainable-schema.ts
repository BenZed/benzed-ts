import Schema from '../schema'

import type Or from './or'

/* eslint-disable 
    @typescript-eslint/no-var-requires
*/
//// Main ////

class ChainableSchema<T> extends Schema<T> {

    get or(): Or<this> {
        const _Or = require('./or').Or as typeof Or
        return new _Or(this)
    }

    // get and(): And<this> {}

}

//// Exports ////

export default ChainableSchema

export {
    ChainableSchema
}