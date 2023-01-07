import Schema from '../schema/schema'
import type OrSchemaFactory from './or'

/* eslint-disable 
    @typescript-eslint/no-var-requires
*/
////  ////

class SchemaChain<T> extends Schema<T> {

    get or(): OrSchemaFactory {
        const Or = require('./or').OrSchemaFactory as typeof OrSchemaFactory
        return new Or()
    }

}

//// Exports ////

export default SchemaChain

export {
    SchemaChain
}