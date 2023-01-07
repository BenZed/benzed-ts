import Schema from '../schema/schema'
import type OrSchemata from './or'

/* eslint-disable 
    @typescript-eslint/no-var-requires
*/
//// Main ////

class ChainableSchema<T> extends Schema<T> {

    get or(): OrSchemata<this> {
        const Or = require('./or').OrSchemata as typeof OrSchemata
        return new Or(this)
    }

    // get and(): AndSchemata<this> {}

}

//// Exports ////

export default ChainableSchema

export {
    ChainableSchema
}